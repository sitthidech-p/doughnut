package com.odde.doughnut.controllers.dto;

import com.odde.doughnut.entities.LinkType;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.lang.NonNull;

@NoArgsConstructor
@Data
public class NoteTopic {
  @NonNull private Integer id;
  @NonNull private String topicConstructor;
  private LinkType linkType;
  private NoteTopic targetNoteTopic;
  private NoteTopic parentNoteTopic;
}
