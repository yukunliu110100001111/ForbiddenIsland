package Game.ForbiddenIsland.WebReceiveServlet;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.util.Enumeration;

@WebServlet("/data")
public class WebReceiveServlet extends HttpServlet {
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        handleRequest(request, response, "GET1");
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        handleRequest(request, response, "POST");
    }

    private void handleRequest(HttpServletRequest request, HttpServletResponse response, String method) throws IOException {
        response.setContentType("text/plain;charset=UTF-8");
        response.getWriter().println("Request Method: " + method);

        Enumeration<String> parameterNames = request.getParameterNames();
        while (parameterNames.hasMoreElements()) {
            String paramName = parameterNames.nextElement();
            String paramValue = request.getParameter(paramName);
            response.getWriter().println(paramName + ": " + paramValue);
        }
    }
}
