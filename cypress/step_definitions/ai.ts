/// <reference types="cypress" />
/// <reference types="../support" />
// @ts-check

import {
  Given,
  Then,
  DataTable,
} from "@badeball/cypress-cucumber-preprocessor";
import "../support/string.extensions";

Given("open AI service always think the system token is invalid", () => {
  cy.openAiService().alwaysResponseAsUnauthorized();
});

Then(
  "I should be prompted with an error message saying {string}",
  (errorMessage: string) => {
    cy.expectFieldErrorMessage("Prompt", errorMessage);
  }
);

Given(
  "OpenAI by default returns text completion {string}",
  (description: string) => {
    cy.openAiService().stubChatCompletion(description, "stop");
  }
);

Given(
  "OpenAI completes with {string} for context containing {string}",
  (returnMessage: string, context: string) => {
    cy.openAiService().mockChatCompletionWithContext(returnMessage, context);
  }
);

Given(
  "OpenAI completes with {string} for assistant message {string}",
  (returnMessage: string, incompleteAssistantMessage: string) => {
    cy.openAiService().mockChatCompletionWithIncompleteAssistantMessage(
      incompleteAssistantMessage,
      returnMessage,
      "stop"
    );
  }
);

Given("OpenAI always return image of a moon", () => {
  cy.openAiService().stubCreateImage();
});

Given(
  "OpenAI returns an incomplete text completion {string} for assistant message {string}",
  (description: string, assistantMessage: string) => {
    cy.openAiService().mockChatCompletionWithIncompleteAssistantMessage(
      assistantMessage,
      description,
      "length"
    );
  }
);

Given("An OpenAI response is unavailable", () => {
  cy.openAiService().stubOpenAiCompletionWithErrorResponse()
});

Given("OpenAI by default returns this question from now:",(questionTable: DataTable) => {
    const record = questionTable.hashes()[0];
    const reply = JSON.stringify({
      stem: record.question,
      correctChoice: record.correct_choice,
      incorrectChoices: [record.incorrect_choice_1, record.incorrect_choice_2],
    });
    cy.openAiService().restartImposter();
    cy.openAiService().stubChatCompletionFunctionCall(
      "ask_single_answer_multiple_choice_question",
      reply
    );
  }
);

Then("it should consider the context {string}", (path: string) => {
  cy.openAiService().thePreviousRequestShouldHaveIncludedPathInfo(path)
})

Given(
  "OpenAI by default returns this question that does not make sense:",
  (questionTable: DataTable) => {
    const record = questionTable.hashes()[0];
    const reply = JSON.stringify({
      stem: record.question,
      correctChoice: record.correct_choice,
      incorrectChoices: [record.incorrect_choice_1, record.incorrect_choice_2],
    });
    cy.openAiService().restartImposter();
    cy.openAiService().stubChatCompletionFunctionCall(
      "ask_single_answer_multiple_choice_question",
      reply
    );
  }
);

Then("I ask it to regenerete another question", () => {
  cy.findByRole("button", { name: "Doesn't make sense?" }).click();
});

Given("AI question responses for instructions mapping is:", (questionTable: DataTable) => {
  cy.openAiService().restartImposter()

  const records = questionTable.hashes()

  for (const mapping of records) {

    const reply = JSON.stringify({
      stem: mapping.expected_question_stem,
      correctChoice: "A",
      incorrectChoices: ["B", "C"],
    })

    cy.openAiService().stubChatCompletionFunctionCall(
      "ask_single_answer_multiple_choice_question",
      reply,
      mapping.instruction
    )
  }
})

Then("Question stem generated from the note {string} should be {string}" , (note: string, stem: string) => {
  cy.findByText(stem)
})