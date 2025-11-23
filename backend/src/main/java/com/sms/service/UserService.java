package com.sms.service;

import com.sms.model.User;

public interface UserService {

    User createAdminIfNotExists();

    User findByUsername(String username);
}
