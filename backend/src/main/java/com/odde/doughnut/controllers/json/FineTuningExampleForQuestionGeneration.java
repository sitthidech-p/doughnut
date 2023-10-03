package com.odde.doughnut.controllers.json;

import com.theokanning.openai.completion.chat.ChatMessage;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
public class FineTuningExampleForQuestionGeneration {
  private @Getter List<SimplifiedOpenAIChatMessage> messages;

  public static FineTuningExampleForQuestionGeneration fromChatMessages(
      List<ChatMessage> messages1) {
    List<SimplifiedOpenAIChatMessage> simplifiedOpenAIChatMessages =
        messages1.stream().map(SimplifiedOpenAIChatMessage::fromOpenAIChatMessage).toList();
    return new FineTuningExampleForQuestionGeneration(simplifiedOpenAIChatMessages);
  }
}
