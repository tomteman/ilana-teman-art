package com.webdev.ilana;

import java.io.IOException;
import javax.servlet.http.*;

@SuppressWarnings("serial")
public class Ilana_teman_artServlet extends HttpServlet {
	public void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws IOException {
		resp.setContentType("text/plain");
		resp.getWriter().println("Hello, world");
	}
}
