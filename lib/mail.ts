import nodemailer from "nodemailer";

type SendMailOptions = {
	email: string;
	subject: string;
	text: string;
	html?: string;
	replyTo?: string;
	attachments?: Array<{
		filename: string;
		path?: string;
		content?: string | Buffer;
		cid?: string;
		contentType?: string;
	}>;
};

export async function sendMail(options: SendMailOptions) {
	const { email, subject, text, html, replyTo, attachments } = options;
	const smtpHost = process.env.SMTP_HOST;
	const smtpPort = Number(process.env.SMTP_PORT || "587");
	const smtpSecure = process.env.SMTP_SECURE === "true";
	const smtpUser = process.env.SMTP_USER || process.env.MAIL_USER;
	const smtpPass = process.env.SMTP_PASS || process.env.MAIL_PASS;

	if (!smtpUser || !smtpPass) {
		throw new Error(
			"Configuration email manquante. Configure SMTP_USER/SMTP_PASS (ou MAIL_USER/MAIL_PASS)."
		);
	}

	const transporter = smtpHost
		? nodemailer.createTransport({
			host: smtpHost,
			port: smtpPort,
			secure: smtpSecure,
			auth: {
				user: smtpUser,
				pass: smtpPass,
			},
		})
		: nodemailer.createTransport({
			service: "gmail",
			auth: {
				user: smtpUser,
				pass: smtpPass,
			},
		});

	const fromAddress = process.env.MAIL_FROM || smtpUser;
	const fromName = process.env.MAIL_FROM_NAME || "La Guinguette des Marmouz";

	await transporter.sendMail({
		from: `${fromName} <${fromAddress}>`,
		to: email,
		replyTo,
		subject,
		text,
		html,
		attachments,
	});
}