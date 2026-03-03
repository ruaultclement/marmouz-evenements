import nodemailer from "nodemailer";

export async function sendMail(email: string, subject: string, text: string) {
	const user = process.env.MAIL_USER;
	const pass = process.env.MAIL_PASS;

	if (!user || !pass) {
		throw new Error(
			"Configuration email manquante. Configure MAIL_USER et MAIL_PASS dans .env.local"
		);
	}

	const transporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			user,
			pass,
		},
	});

	await transporter.sendMail({
		from: `La Guinguette des Marmouz <${user}>`,
		to: email,
		subject,
		text,
	});
}