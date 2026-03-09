package com.careertwin;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

public class SessionUtil {

    public static HttpSession getSession(HttpServletRequest req) {
        return req.getSession(false);
    }

    public static boolean isValidSession(HttpSession session) {
        return session != null && session.getAttribute("userEmail") != null;
    }

    public static String getUserEmail(HttpSession session) {
        if (isValidSession(session)) {
            return (String) session.getAttribute("userEmail");
        }
        return null;
    }
}
