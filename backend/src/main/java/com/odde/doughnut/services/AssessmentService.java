package com.odde.doughnut.services;

import static com.odde.doughnut.controllers.dto.ApiError.ErrorType.ASSESSMENT_SERVICE_ERROR;

import com.odde.doughnut.entities.Note;
import com.odde.doughnut.entities.Notebook;
import com.odde.doughnut.entities.QuizQuestion;
import com.odde.doughnut.exceptions.ApiException;
import com.odde.doughnut.factoryServices.ModelFactoryService;
import com.theokanning.openai.client.OpenAiApi;
import java.util.List;
import java.util.Objects;

public class AssessmentService {
  private final ModelFactoryService modelFactoryService;
  private final QuizQuestionService quizQuestionService;

  public AssessmentService(OpenAiApi openAiApi, ModelFactoryService modelFactoryService) {
    this.quizQuestionService = new QuizQuestionService(openAiApi, modelFactoryService);
    this.modelFactoryService = modelFactoryService;
  }

  private QuizQuestion getQuizQuestion(Note note) {
    return this.modelFactoryService.getQuizQuestionsByNote(note).stream()
        .filter(q -> q.approved)
        .findFirst()
        .orElse(null);
  }

  public List<QuizQuestion> generateAssessment(Notebook notebook, boolean newAIQuestionsOnly) {
    List<QuizQuestion> questions =
        notebook.getNotes().stream()
            .map(
                n ->
                    newAIQuestionsOnly
                        ? quizQuestionService.generateAIQuestion(n)
                        : getQuizQuestion(n))
            .filter(Objects::nonNull)
            .limit(5)
            .toList();
    if (questions.size() < 5) {
      throw new ApiException(
          "Not enough approved questions",
          ASSESSMENT_SERVICE_ERROR,
          "Not enough approved questions");
    }

    return questions;
  }
}
