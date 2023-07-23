import Builder from "./Builder";
import generateId from "./generateId";

class QuizQuestionBuilder extends Builder<Generated.QuizQuestion> {
  quizQuestion: Generated.QuizQuestion = {
    quizQuestionId: generateId(),
    rawJsonQuestion: "",
    questionType: "JUST_REVIEW",
    options: [
      {
        picture: false,
        display: "question",
      },
    ],
    viceReviewPointIdList: [],
    description: "answer",
    mainTopic: "",
    hintLinks: {
      links: {},
    },
  };

  withClozeSelectionQuestion() {
    return this.withQuestionType("CLOZE_SELECTION");
  }

  withQuestionType(questionType: Generated.QuestionType) {
    this.quizQuestion.questionType = questionType;
    return this;
  }

  withQuestionStem(stem: string) {
    this.quizQuestion.description = stem;
    return this;
  }

  withRawJsonQuestion(json: string) {
    this.quizQuestion.rawJsonQuestion = json;
    return this;
  }

  do(): Generated.QuizQuestion {
    return this.quizQuestion;
  }
}

export default QuizQuestionBuilder;
