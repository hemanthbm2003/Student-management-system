package com.sms.dto;

import java.time.LocalDateTime;

public class ApiResponse {

    private boolean success;
    private String message;
    private LocalDateTime timestamp;

    public static ApiResponse ok(String message) {
        ApiResponse res = new ApiResponse();
        res.success = true;
        res.message = message;
        res.timestamp = LocalDateTime.now();
        return res;
    }

    public static ApiResponse fail(String message) {
        ApiResponse res = new ApiResponse();
        res.success = false;
        res.message = message;
        res.timestamp = LocalDateTime.now();
        return res;
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
