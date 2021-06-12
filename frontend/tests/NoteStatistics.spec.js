import NoteStatistics from '@/components/NoteStatistics.vue';
import { mount } from '@vue/test-utils';
import flushPromises from 'flush-promises';

beforeEach(() => {
  fetch.resetMocks();
});

const stubResponse = {
  "reviewPoint":{
    "id":1,
    "lastReviewedAt":"1976-06-01T17:00:00.000+00:00",
    "nextReviewAt":"1976-06-01T17:00:00.000+00:00",
    "initialReviewedAt":"1976-06-01T17:00:00.000+00:00",
    "repetitionCount":2,
    "forgettingCurveIndex":110,
    "removedFromReview":false
  },
  "note":{
    "id":1,
    "noteContent":{
      "id":1,"title":"Fungible","description":null,"url":null,"urlIsVideo":false,
      "pictureUrl":null,"pictureMask":null,"useParentPicture":false,
      "skipReview":false,"hideTitleInArticle":false,"showAsBulletInArticle":false,
      "updatedDatetime":"2021-06-12T04:17:51.000+00:00","notePicture":null
    },
    "createdDatetime":"2021-06-12T04:17:51.000+00:00",
    "title":"Fungible","head":true
  }
}

describe('note statistics', () => {

  test('fetchBlogPosts API to be called ONCE with article rendered', async () => {
    fetch.mockResponseOnce(JSON.stringify({}));
    const wrapper = mount(NoteStatistics, {propsData: {noteid: 123}});
    await flushPromises()
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('/api/notes/123/statistics');
    expect(wrapper.findAll(".statistics-value")).toHaveLength(0)
  });

  test('should render values', async () => {
    fetch.mockResponseOnce(JSON.stringify(stubResponse));
    const wrapper = mount(NoteStatistics, {propsData: {noteid: 123}});
    await flushPromises()

    expect(wrapper.findAll(".statistics-value")).toHaveLength(5)
  });

});
