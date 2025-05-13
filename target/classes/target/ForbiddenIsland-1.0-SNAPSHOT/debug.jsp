<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html>
<head>
  <title>Debug - WebReceiveServlet</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    input, button, select, textarea {
      margin: 6px 0;
      padding: 8px;
      width: 100%;
      max-width: 400px;
    }
    textarea {
      height: 100px;
    }
    pre {
      background-color: #f4f4f4;
      border: 1px solid #ccc;
      padding: 10px;
      white-space: pre-wrap;
    }
    .success { color: green; }
    .error { color: red; }
  </style>
  <script>
    async function sendDebugRequest(method) {
      const type = document.getElementById("type").value;
      const page = document.getElementById("page").value;
      const extra = document.getElementById("extra").value;

      const params =
              "type=" + encodeURIComponent(type) +
              "&page=" + encodeURIComponent(page) +
              "&extra=" + encodeURIComponent(extra);

      let url = "data";
      let options = {
        method: method,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      };

      if (method === "POST") {
        options.body = params;
      } else {
        url += "?" + params;
      }

      try {
        const res = await fetch(url, options);
        const text = await res.text();
        document.getElementById("status").innerText = res.status + " " + res.statusText;
        document.getElementById("response").innerText = text;
        document.getElementById("status").className = res.ok ? "success" : "error";
      } catch (err) {
        document.getElementById("status").innerText = "Request failed";
        document.getElementById("status").className = "error";
        document.getElementById("response").innerText = err.message;
      }
    }
  </script>

</head>
<body>
<h2>WebReceiveServlet 调试界面</h2>

<label>type:</label>
<input type="text" id="type" placeholder="如 sql" value="sql">

<label>page:</label>
<input type="text" id="page" placeholder="页码" value="1">

<label>extra (任意参数):</label>
<input type="text" id="extra" placeholder="附加参数" value="test123">

<button onclick="sendDebugRequest('GET')">发送 GET 请求</button>
<button onclick="sendDebugRequest('POST')">发送 POST 请求</button>

<h3>响应状态：</h3>
<p id="status">未发送</p>

<h3>响应内容：</h3>
<pre id="response">等待请求...</pre>
</body>
</html>
