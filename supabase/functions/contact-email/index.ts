import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  try {
    const { name, email, message } = await req.json();

    const emailText = `
New Contact Form Submission

Name: ${name}
Email: ${email}

Message:
${message}
    `;

    const res = await fetch("https://api.mailchannels.net/tx/v1/send", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: "info@milwaukeetshirtco.com" }]
          }
        ],
        from: {
          email: "contact@milwaukeetshirtco.com",
          name: "MTC Contact Form"
        },
        subject: "New Contact Form Submission",
        content: [
          {
            type: "text/plain",
            value: emailText
          }
        ]
      })
    });

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: "MailChannels request failed", status: res.status }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        }
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.toString() }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
});
