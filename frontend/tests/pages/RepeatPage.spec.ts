/**
 * @jest-environment jsdom
 */
import RepeatPage from '@/pages/RepeatPage.vue';
import flushPromises from 'flush-promises';
import helper from '../helpers';
import makeMe from '../fixtures/makeMe';
import RenderingHelper from "../helpers/RenderingHelper";
import usePopups, { PopupInfo } from '../../src/components/commons/Popups/usePopup';

let renderer: RenderingHelper
let mockRouterPush = jest.fn();

helper.resetWithApiMock(beforeEach, afterEach)

beforeEach(() => {
  mockRouterPush = jest.fn();
  renderer = helper.component(RepeatPage).withMockRouterPush(mockRouterPush);
});

describe('repeat page', () => {
  let note = makeMe.aNoteSphere.please();

  const mountPage = async (repetition: Generated.RepetitionForUser | Record<string, never>) => {
    helper.store.loadNoteSpheres([note]);
    helper.apiMock.expecting('/api/reviews/repeat', repetition);
    const wrapper = renderer.currentRoute({ name: 'repeat' }).mount()
    await flushPromises();
    return wrapper;
  };

  it('redirect to review page if nothing to repeat', async () => {
    await mountPage({});
    helper.apiMock.verifyCall('/api/reviews/repeat')
    expect(mockRouterPush).toHaveBeenCalledWith({ name: 'reviews' });
  });

  it('replace route with repeat/quiz if there is a quiz', async () => {
    const repetition = makeMe.aRepetition.ofNote(note).please();
    await mountPage(repetition);
    expect(mockRouterPush).toHaveBeenCalledWith({ name: 'repeat-quiz' });
  });

  describe('repeat page with "just review" quiz', () => {
    let repetition: Generated.RepetitionForUser;

    beforeEach(()=>{
      note = makeMe.aNoteSphere.please();
      helper.store.loadNoteSpheres([note]);
      repetition = makeMe.aRepetition.ofNote(note).quizType("JUST_REVIEW").please();
    })

    it('stay at repeat page if there is no quiz', async () => {
      await mountPage(repetition);
      expect(mockRouterPush).toHaveBeenCalledWith({
        name: 'repeat-quiz',
      });
    });

    it('should call the self-evaluate api', async () => {
      const reviewPointId = repetition.reviewPointViewedByUser.reviewPoint.id;
      const wrapper = await mountPage(repetition);
      helper.apiMock.expecting(`/api/reviews/${reviewPointId}/self-evaluate`)
      await wrapper.find('#repeat-sad').trigger('click');
    });

    it('reload next review point if 404', async () => {
      const {popups} = usePopups()
      const popupData = {} as { popupInfo?: PopupInfo}
      popups.register(popupData)
      const reviewPointId = repetition.reviewPointViewedByUser.reviewPoint.id;
      const wrapper = await mountPage(repetition);

      helper.apiMock.expectingResponse(`/api/reviews/${reviewPointId}/self-evaluate`, {status: 404})

      wrapper.find('#repeat-sad').trigger('click');
      await flushPromises();
      expect(popupData.popupInfo?.message).toMatch(/review point/)
      helper.apiMock.verifyCall(`/api/reviews/repeat`)
    });
  });
});
