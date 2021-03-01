package com.odde.doughnut.testability.builders;

import com.odde.doughnut.entities.User;
import com.odde.doughnut.entities.repositories.UserRepository;
import com.odde.doughnut.services.ModelFactoryService;
import com.odde.doughnut.testability.MakeMe;

public class UserBuilder {
    static TestObjectCounter exIdCounter = new TestObjectCounter(n->"exid" + n);
    static TestObjectCounter nameCounter = new TestObjectCounter(n->"user" + n);

    private User user = new User();
    private final MakeMe makeMe;


    public UserBuilder(MakeMe makeMe) {
        this.makeMe = makeMe;
        user.setExternalIdentifier(exIdCounter.generate());
        user.setName(nameCounter.generate());
    }

    public UserBuilder with2Notes() {
        user.getNotes().add(makeMe.aNote().inMemoryPlease());
        user.getNotes().add(makeMe.aNote().inMemoryPlease());
        return this;
    }

    public User inMemoryPlease() {
        return user;
    }

    public User please(ModelFactoryService modelFactoryService) {
        modelFactoryService.userRepository.save(user);
        return user;
    }
}

