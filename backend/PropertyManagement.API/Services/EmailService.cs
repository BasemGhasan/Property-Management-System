using System.Net;
using Amazon.SimpleEmail;
using Amazon.SimpleEmail.Model;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace PropertyManagement.API.Services;

public class EmailService(IAmazonSimpleEmailService ses, IConfiguration config, ILogger<EmailService> logger)
{
    private const string BrandName = "Property Management System";

    public Task SendPasswordResetEmailAsync(string fullName, string toEmail, string resetLink, int expiryMinutes)
    {
        var safeName = WebUtility.HtmlEncode(fullName);
        var safeLink = WebUtility.HtmlEncode(resetLink);

        var html = $"""
            <p style="margin:0 0 16px;font-size:16px;color:#111827;">Hi {safeName},</p>
            <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#374151;">
              We received a request to reset the password for your account. Click the button below to choose a new one.
            </p>
            <table role="presentation" cellpadding="0" cellspacing="0">
              <tr>
                <td style="border-radius:8px;background-color:#2563eb;">
                  <a href="{safeLink}" style="display:inline-block;padding:12px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">
                    Reset Password
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#6b7280;">
              This link expires in {expiryMinutes} minutes. If you didn't request a password reset, you can safely ignore this email — your password won't be changed.
            </p>
            <p style="margin:16px 0 0;font-size:13px;line-height:1.6;color:#9ca3af;">
              Button not working? Copy and paste this link into your browser:<br>
              <a href="{safeLink}" style="color:#2563eb;word-break:break-all;">{safeLink}</a>
            </p>
            """;

        var text = $"Hi {fullName},\n\nWe received a request to reset your password. Open this link to choose a new one:\n{resetLink}\n\nThis link expires in {expiryMinutes} minutes. If you didn't request this, you can safely ignore this email.";

        return SendAsync(toEmail, "Reset your password", html, text);
    }

    public Task SendVerificationEmailAsync(string fullName, string toEmail, string code, int expiryMinutes)
    {
        var safeName = WebUtility.HtmlEncode(fullName);
        var safeCode = WebUtility.HtmlEncode(code);

        var html = $"""
            <p style="margin:0 0 16px;font-size:16px;color:#111827;">Hi {safeName},</p>
            <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#374151;">
              Use the code below to verify your email address.
            </p>
            <p style="margin:0 0 24px;text-align:center;font-size:32px;font-weight:700;letter-spacing:8px;color:#2563eb;">
              {safeCode}
            </p>
            <p style="margin:0;font-size:13px;line-height:1.6;color:#6b7280;">
              This code expires in {expiryMinutes} minutes. If you didn't request this, you can safely ignore this email.
            </p>
            """;

        var text = $"Hi {fullName},\n\nYour email verification code is: {code}\n\nThis code expires in {expiryMinutes} minutes. If you didn't request this, you can safely ignore this email.";

        return SendAsync(toEmail, "Verify your email", html, text);
    }

    public Task SendRequestCreatedEmailAsync(string ownerName, string ownerEmail, string requesterName, string propertyName, string requestTitle, string priority)
    {
        var safeOwnerName = WebUtility.HtmlEncode(ownerName);
        var safeRequester = WebUtility.HtmlEncode(requesterName);
        var safeProperty = WebUtility.HtmlEncode(propertyName);
        var safeTitle = WebUtility.HtmlEncode(requestTitle);
        var safePriority = WebUtility.HtmlEncode(priority);

        var html = $"""
            <p style="margin:0 0 16px;font-size:16px;color:#111827;">Hi {safeOwnerName},</p>
            <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#374151;">
              {safeRequester} submitted a new maintenance request for <strong>{safeProperty}</strong>.
            </p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;border-radius:8px;">
              <tr>
                <td style="padding:16px 20px;">
                  <p style="margin:0 0 6px;font-size:14px;color:#111827;"><strong>{safeTitle}</strong></p>
                  <p style="margin:0;font-size:13px;color:#6b7280;">Priority: {safePriority}</p>
                </td>
              </tr>
            </table>
            <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#6b7280;">
              Sign in to your dashboard to review and respond.
            </p>
            """;

        var text = $"Hi {ownerName},\n\n{requesterName} submitted a new maintenance request for {propertyName}.\n\n{requestTitle} (Priority: {priority})\n\nSign in to your dashboard to review and respond.";

        return SendAsync(ownerEmail, $"New maintenance request: {requestTitle}", html, text);
    }

    public Task SendRequestStatusUpdatedEmailAsync(string residentName, string residentEmail, string requestTitle, string newStatus, string? ownerNotes)
    {
        var safeName = WebUtility.HtmlEncode(residentName);
        var safeTitle = WebUtility.HtmlEncode(requestTitle);
        var safeStatus = WebUtility.HtmlEncode(newStatus);
        var notesHtml = string.IsNullOrWhiteSpace(ownerNotes)
            ? ""
            : $"""<p style="margin:12px 0 0;font-size:13px;line-height:1.6;color:#6b7280;">Note from the owner: {WebUtility.HtmlEncode(ownerNotes)}</p>""";

        var html = $"""
            <p style="margin:0 0 16px;font-size:16px;color:#111827;">Hi {safeName},</p>
            <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#374151;">
              Your maintenance request has been updated.
            </p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;border-radius:8px;">
              <tr>
                <td style="padding:16px 20px;">
                  <p style="margin:0 0 6px;font-size:14px;color:#111827;"><strong>{safeTitle}</strong></p>
                  <p style="margin:0;font-size:13px;color:#6b7280;">Status: {safeStatus}</p>
                  {notesHtml}
                </td>
              </tr>
            </table>
            """;

        var text = $"Hi {residentName},\n\nYour maintenance request \"{requestTitle}\" is now: {newStatus}."
            + (string.IsNullOrWhiteSpace(ownerNotes) ? "" : $"\n\nNote from the owner: {ownerNotes}");

        return SendAsync(residentEmail, $"Update on your request: {requestTitle}", html, text);
    }

    private string WrapLayout(string bodyHtml) => $"""
        <!DOCTYPE html>
        <html>
        <body style="margin:0;padding:0;background-color:#f4f5f7;font-family:Segoe UI,Helvetica,Arial,sans-serif;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7;padding:32px 16px;">
            <tr>
              <td align="center">
                <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
                  <tr>
                    <td style="background-color:#2563eb;padding:24px 32px;">
                      <span style="color:#ffffff;font-size:18px;font-weight:600;">{BrandName}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:32px;">
                      {bodyHtml}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
        """;

    private async Task SendAsync(string toEmail, string subject, string htmlBody, string textBody)
    {
        var fromAddress = config["Ses:FromAddress"];
        if (string.IsNullOrWhiteSpace(fromAddress))
        {
            logger.LogError("Ses:FromAddress is not configured; skipping email '{Subject}' to {Email}.", subject, toEmail);
            return;
        }

        var request = new SendEmailRequest
        {
            Source = fromAddress,
            Destination = new Destination { ToAddresses = [toEmail] },
            Message = new Message
            {
                Subject = new Content(subject),
                Body = new Body
                {
                    Html = new Content { Charset = "UTF-8", Data = WrapLayout(htmlBody) },
                    Text = new Content { Charset = "UTF-8", Data = textBody }
                }
            }
        };

        try
        {
            await ses.SendEmailAsync(request);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send '{Subject}' email via SES to {Email}.", subject, toEmail);
        }
    }
}
