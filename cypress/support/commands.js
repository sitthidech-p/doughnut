// ***********************************************
// custom commands and overwrite existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

/// <reference types="cypress" />

import "@testing-library/cypress/add-commands";
import "cypress-file-upload";

// const compareSnapshotCommand = require('cypress-image-diff-js/dist/command');
// compareSnapshotCommand();

Cypress.Commands.add("pageIsLoaded", () => {
  cy.get(".loading-bar").should("not.exist");
});

Cypress.Commands.add("loginAs", (username) => {
  const password = "password";
  cy.request({
    method: "POST",
    url: "/login",
    form: true,
    body: { username, password },
  }).then((response) => {
    expect(response.status).to.equal(200);
  });
});

Cypress.Commands.add("logout", (username) => {
  cy.request({
    method: "POST",
    url: "/logout",
  }).then((response) => {
    expect(response.status).to.equal(204);
  });
});

Cypress.Commands.add("createLink", (type, fromNoteTitle, toNoteTitle) => {
  cy.get("@seededNoteIdMap").then((seededNoteIdMap) =>
    cy
      .request({
        method: "POST",
        url: "/api/testability/link_notes",
        body: {
          type,
          source_id: seededNoteIdMap[fromNoteTitle],
          target_id: seededNoteIdMap[toNoteTitle],
        },
      })
      .its("body")
      .should("contain", "OK")
  );
});

Cypress.Commands.add("triggerException", () => {
  cy.request({
    method: "POST",
    url: `/api/testability/trigger_exception`,
    failOnStatusCode: false,
  });
});

Cypress.Commands.add("submitNoteFormWith", (noteAttributes) => {
  for (var propName in noteAttributes) {
    const value = noteAttributes[propName];
    if (value) {
      cy.getFormControl(propName).then(($input) => {
        if ($input.attr("type") === "file") {
          cy.fixture(value).then((img) => {
            cy.wrap($input).attachFile({
              fileContent: Cypress.Blob.base64StringToBlob(img),
              fileName: value,
              mimeType: "image/png",
            });
          });
        } else if ($input.attr("role") === "radiogroup") {
          cy.clickRadioByLabel(value);
        } else {
          cy.wrap($input).clear().type(value);
        }
      });
    }
  }
  cy.get('input[value="Submit"]').click();
});

Cypress.Commands.add("clickAddChildNoteButton", () => {
  cy.findAllByRole("button", { name: "Add Child Note" }).first().click();
});

Cypress.Commands.add("clickRadioByLabel", (labelText) => {
  cy.findByText(labelText, { selector: "label" }).click({ force: true });
});

Cypress.Commands.add("submitNoteFormsWith", (notes) => {
  notes.forEach((noteAttributes) => cy.submitNoteFormWith(noteAttributes));
});

Cypress.Commands.add("expectNoteCards", (expectedCards) => {
  expectedCards.forEach((elem) => {
    for (var propName in elem) {
      if (propName === "note-title") {
        cy.findByText(elem[propName], { selector: ".card-title a" }).should(
          "be.visible"
        );
      } else {
        cy.findByText(elem[propName]);
      }
    }
  });
});

Cypress.Commands.add("navigateToChild", (noteTitle) => {
  cy.findByText(noteTitle, { selector: ".card-title" }).click();
});

Cypress.Commands.add("navigateToNotePage", (noteTitlesDividedBySlash) => {
  cy.visitMyNotebooks();
  noteTitlesDividedBySlash
    .commonSenseSplit("/")
    .forEach((noteTitle) => cy.navigateToChild(noteTitle));
});

// jumptoNotePage is faster than navigateToNotePage
//    it uses the note id memorized when creating them with testability api
Cypress.Commands.add("jumpToNotePage", (noteTitle) => {
  cy.get("@seededNoteIdMap").then(
    (seededNoteIdMap) => cy.visit(`/notes/${seededNoteIdMap[noteTitle]}`)
    //        cy.window().then(win=> {
    //          if(!!win.router) {
    //                const noteId = seededNoteIdMap[noteTitle]
    //                win.router.push({name: "noteShow", params: {noteId}})
    //                return
    //          }
    //          return cy.visit(`/notes/${seededNoteIdMap[noteTitle]}`)
    //        })
  );
});

Cypress.Commands.add("clickButtonOnCardBody", (noteTitle, buttonTitle) => {
  const card = cy.findByText(noteTitle, { selector: ".card-title a" });
  const button = card.parent().parent().findByText(buttonTitle);
  button.click();
});

Cypress.Commands.add("visitMyNotebooks", (noteTitle) => {
  cy.visit("/notebooks");
});

Cypress.Commands.add("creatingLinkFor", (noteTitle) => {
  cy.clickNotePageButton(noteTitle, "link note");
});

Cypress.Commands.add("clickNotePageButton", (noteTitle, btnTextOrTitle) => {
  cy.jumpToNotePage(noteTitle);
  cy.get(".note-with-controls")
    .findByRole("button", { name: btnTextOrTitle })
    .click();
});

Cypress.Commands.add(
  "clickNotePageMoreOptionsButton",
  (noteTitle, btnTextOrTitle) => {
    cy.jumpToNotePage(noteTitle);
    cy.clickNotePageMoreOptionsButtonOnCurrentPage(btnTextOrTitle);
  }
);

Cypress.Commands.add(
  "clickNotePageMoreOptionsButtonOnCurrentPage",
  (btnTextOrTitle) => {
    cy.get(".note-with-controls")
      .findByRole("button", { name: "more options" })
      .click();
    cy.get(".note-with-controls")
      .findByRole("button", { name: btnTextOrTitle })
      .click();
  }
);

Cypress.Commands.add("expectExactLinkTargets", (targets) => {
  targets.forEach((elem) => {
    cy.findByText(elem, { selector: ".card-title a" }).should("be.visible");
  });
  cy.findAllByText(/.*/, { selector: ".card-title a" }).should(
    "have.length",
    targets.length
  );
});

Cypress.Commands.add("findNoteCardButton", (noteTitle, btnTextOrTitle) => {
  return cy
    .findByText(noteTitle)
    .parent()
    .parent()
    .parent()
    .findByRole("button", { name: btnTextOrTitle });
});

Cypress.Commands.add("findNoteCardEditButton", (noteTitle) => {
  return cy.findNoteCardButton(noteTitle, "edit note");
});

Cypress.Commands.add("updateCurrentUserSettingsWith", (hash) => {
  cy.request({
    method: "POST",
    url: "/api/testability/update_current_user",
    body: hash,
  })
    .its("body")
    .should("contain", "OK");
});

Date.prototype.addDays = function (days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
};

Cypress.Commands.add(
  "initialReviewOneNoteIfThereIs",
  ({ review_type, title, additional_info, skip }) => {
    if (review_type == "initial done") {
      cy.findByText("You have achieved your daily new notes goal.").should(
        "be.visible"
      );
    } else {
      cy.findByText(title, { selector: "h2" });
      switch (review_type) {
        case "single note": {
          if (additional_info) {
            cy.get(".note-body").should("contain", additional_info);
          }
          break;
        }

        case "picture note": {
          if (additional_info) {
            const [expectedDescription, expectedPicture] =
              additional_info.commonSenseSplit("; ");
            cy.get(".note-body").should("contain", expectedDescription);
            cy.get("#note-picture")
              .find("img")
              .should("have.attr", "src")
              .should("include", expectedPicture);
          }
          break;
        }

        case "link": {
          if (additional_info) {
            const [linkType, targetNote] =
              additional_info.commonSenseSplit("; ");
            cy.expectNoteTitle(title);
            cy.expectNoteTitle(targetNote);
            cy.get(".badge").contains(linkType);
          }
          break;
        }

        default:
          expect(review_type).equal("a known review page type");
      }
      if (skip) {
        cy.findByText("Skip repetition").click();
        cy.findByRole("button", { name: "OK" }).click();
      } else {
        cy.findByText("Keep for repetition").click();
      }
    }
  }
);

Cypress.Commands.add(
  "expectNoteTitle",
  (title) => cy.findByText(title, { selector: "[role=title]" }) //.should("be.visible")
  // Add should be visible back when the link view page is remade.
);

Cypress.Commands.add(
  "repeatReviewOneNoteIfThereIs",
  ({ review_type, title, additional_info }) => {
    if (review_type == "repeat done") {
      cy.findByText("You have reviewed all the old notes for today.").should(
        "be.visible"
      );
    } else {
      cy.findByText(title, { selector: "h2" });
      switch (review_type) {
        case "single note": {
          if (additional_info) {
            cy.get(".note-body").should("contain", additional_info);
          }
          break;
        }

        default:
          expect(review_type).equal("a known review page type");
      }
      cy.get("#repeat-satisfied").click();
    }
  }
);

Cypress.Commands.add("navigateToCircle", (circleName) => {
  cy.visit("/circles");
  cy.findByText(circleName).click();
});

Cypress.Commands.add("initialReviewInSequence", (reviews) => {
  cy.visit("/reviews/initial");
  reviews.forEach((initialReview) => {
    cy.initialReviewOneNoteIfThereIs(initialReview);
  });
});

Cypress.Commands.add("initialReviewNotes", (noteTitles) => {
  cy.initialReviewInSequence(
    noteTitles.commonSenseSplit(", ").map((title) => {
      return {
        review_type: title === "end" ? "initial done" : "single note",
        title,
      };
    })
  );
});

Cypress.Commands.add("repeatReviewNotes", (noteTitles) => {
  cy.visit("/reviews/repeat");
  noteTitles.commonSenseSplit(",").forEach((title) => {
    const review_type = title === "end" ? "repeat done" : "single note";
    cy.repeatReviewOneNoteIfThereIs({ review_type, title });
  });
});

Cypress.Commands.add("shouldSeeQuizWithOptions", (questionParts, options) => {
  questionParts.forEach((part) => {
    cy.get(".quiz-instruction").contains(part);
  });
  options
    .commonSenseSplit(",")
    .forEach((option) => cy.findByText(option).should("be.visible"));
});

Cypress.Commands.add("getFormControl", (label) => {
  return cy.findByLabelText(label);
});

Cypress.Commands.add("subscribeToNote", (noteTitle, dailyLearningCount) => {
  cy.findNoteCardButton(noteTitle, "Add to my learning").click();
  cy.get("#subscription-dailyTargetOfNewNotes")
    .clear()
    .type(dailyLearningCount);
  cy.findByRole("button", { name: "Submit" }).click();
});

Cypress.Commands.add("unsubscribeFromNotebook", (noteTitle) => {
  cy.visitMyNotebooks();
  cy.findNoteCardButton(noteTitle, "Unsubscribe").click();
});

Cypress.Commands.add("searchNote", (searchKey) => {
  cy.getFormControl("Search Globally").check();
  cy.findByPlaceholderText("Search").clear().type(searchKey);
});

Cypress.Commands.add("visitBlog", () => {
  cy.visit("/index.html");
});

Cypress.Commands.add("assertBlogPostInWebsiteByTitle", (article) => {
  cy.get("#article-container").within(() => {
    cy.get(".article")
      .first()
      .within(() => {
        cy.get(".title").first().should("have.text", article.title);
        cy.get(".content").first().should("have.text", article.description);
        cy.get(".authorName").first().should("have.text", article.authorName);
        cy.get(".createdAt").first().should("have.text", article.createdAt);
      });
  });
});

Cypress.Commands.add("failure", () => {
  throw new Error("Deliberate CYPRESS test Failure!!!");
});

Cypress.Commands.add("copyNotebook", (notebookId) => {
  cy.request({
    method: "POST",
    url: `/api/notebooks/${notebookId}/copy`
  })
      .its("status")
      .should("be", "200");
});
