/**
 * Cloudflare Worker - Lead Form Handler
 * 
 * Receives form submissions from all your fencing sites and sends emails
 * to both you (the agency) and the client (business owner).
 * 
 * SETUP:
 * 1. Create a Cloudflare Worker
 * 2. Add environment variables:
 *    - RESEND_API_KEY: Your Resend API key
 *    - AGENCY_EMAIL: Your email (receives all leads)
 * 3. Deploy this code
 */

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // Only accept POST requests
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      // Parse form data
      const formData = await request.formData();
      
      // Extract form fields
      const leadData = {
        name: formData.get("name") || "Not provided",
        email: formData.get("email") || "Not provided",
        phone: formData.get("phone") || "Not provided",
        service: formData.get("service") || "Not specified",
        message: formData.get("message") || "No message",
        address: formData.get("address") || "",
        timeline: formData.get("timeline") || "",
        service_area: formData.get("service_area") || "",
        
        // Hidden fields for routing
        site_name: formData.get("site_name") || "Unknown Site",
        client_email: formData.get("client_email") || "",
      };

      // Get timestamp
      const timestamp = new Date().toLocaleString("en-US", {
        timeZone: "America/New_York",
        dateStyle: "full",
        timeStyle: "short",
      });

      // Build email content
      const emailSubject = `🚨 New Lead: ${leadData.name} - ${leadData.site_name}`;
      
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #2563eb; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">New Lead Received!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">${leadData.site_name}</p>
          </div>
          
          <div style="padding: 30px; background: #f9fafb;">
            <h2 style="color: #1f2937; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
              Contact Information
            </h2>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold; width: 140px;">Name:</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">${leadData.name}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Email:</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                  <a href="mailto:${leadData.email}" style="color: #2563eb;">${leadData.email}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Phone:</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                  <a href="tel:${leadData.phone}" style="color: #2563eb;">${leadData.phone}</a>
                </td>
              </tr>
              ${leadData.address ? `
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Address:</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">${leadData.address}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Service:</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">${leadData.service}</td>
              </tr>
              ${leadData.service_area ? `
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Service Area:</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">${leadData.service_area}</td>
              </tr>
              ` : ''}
              ${leadData.timeline ? `
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Timeline:</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">${leadData.timeline}</td>
              </tr>
              ` : ''}
            </table>
            
            ${leadData.message && leadData.message !== "No message" ? `
            <h3 style="color: #1f2937; margin-top: 25px;">Message:</h3>
            <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #2563eb;">
              ${leadData.message}
            </div>
            ` : ''}
          </div>
          
          <div style="padding: 20px; background: #1f2937; color: #9ca3af; text-align: center; font-size: 14px;">
            <p style="margin: 0;">Received: ${timestamp}</p>
            <p style="margin: 10px 0 0 0;">Lead from ${leadData.site_name}</p>
          </div>
        </div>
      `;

      const emailText = `
New Lead from ${leadData.site_name}
================================

Name: ${leadData.name}
Email: ${leadData.email}
Phone: ${leadData.phone}
${leadData.address ? `Address: ${leadData.address}` : ''}
Service Interested In: ${leadData.service}
${leadData.service_area ? `Service Area: ${leadData.service_area}` : ''}
${leadData.timeline ? `Timeline: ${leadData.timeline}` : ''}

Message:
${leadData.message}

--------------------------------
Received: ${timestamp}
      `.trim();

      // Send emails via Resend
      const emailPromises = [];

      // Always send to agency (you)
      if (env.AGENCY_EMAIL) {
        emailPromises.push(
          sendEmail(env.RESEND_API_KEY, {
            to: env.AGENCY_EMAIL,
            subject: emailSubject,
            html: emailHtml,
            text: emailText,
          })
        );
      }

      // Send to client if provided
      if (leadData.client_email) {
        emailPromises.push(
          sendEmail(env.RESEND_API_KEY, {
            to: leadData.client_email,
            subject: emailSubject,
            html: emailHtml,
            text: emailText,
          })
        );
      }

      // Wait for all emails to send
      await Promise.all(emailPromises);

      // Return success - redirect to thank you or return JSON
      const referer = request.headers.get("Referer") || "";
      
      // Option 1: Redirect back to site with success parameter
      if (referer) {
        const redirectUrl = new URL(referer);
        redirectUrl.pathname = "/thank-you";
        return Response.redirect(redirectUrl.toString(), 303);
      }

      // Option 2: Return JSON (for AJAX submissions)
      return new Response(
        JSON.stringify({ success: true, message: "Lead submitted successfully" }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );

    } catch (error) {
      console.error("Form submission error:", error);
      
      return new Response(
        JSON.stringify({ success: false, message: "Submission failed" }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  },
};

// Helper function to send email via Resend
async function sendEmail(apiKey, { to, subject, html, text }) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Lead Notifications <onboarding@resend.dev>", // Update this after verifying domain
      to: to,
      subject: subject,
      html: html,
      text: text,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend API error: ${error}`);
  }

  return response.json();
}
