const resend = require('resend');

async function sendEmail(email, name, action) {
    try {
        let subject1 = "Welcome to E-learning! Your Account is Now Active";
        let body1 = `<strong>Dear ${name}</strong>,
            <p>We are thrilled to have you on board! Your registration with [Your Platform Name] has been successfully completed, 
            and we're excited to welcome you to our community.</p>
            
            <p>E-learning is designed to provide you with a seamless experience. We encourage you to explore our features 
            and take advantage of the opportunities we offer. If you have any questions or need assistance, 
            our support team is always here to help.</p>
            
            <p>Thank you for choosing E-learning. We look forward to serving you and making your experience with us as enjoyable 
            and rewarding as possible.</p>
            
            <strong>Best regards,</strong>
            <p>E-learning</p>
            <p>Mo.1234567890</p>
        `;
        let subject2 = `Thank You for Enrolling in Our Web Development Course!`
        let body2 = `<string>Dear ${name}</strong>
            <p>We wanted to take a moment to express our gratitude for choosing to enroll in our Web Development course. 
            We're thrilled to have you join us on this journey of learning and growth.</p>

            <p>We believe that this course will equip you with the skills and knowledge needed to succeed in the field of web development.
            Whether you're a beginner or looking to enhance your existing skills, we're confident 
            that you'll find the content valuable and engaging.</p>

            <p>If you have any questions or need assistance along the way, please don't hesitate to reach out to our support team. 
            We're here to help you succeed!</p>

            <p>Once again, thank you for choosing [Your Company Name]. We're excited to see your progress 
            and celebrate your achievements.</p>

            <strong>Best regards,</strong>
            <p>E-learning</p>
            <p>Mo.1234567890</p>
        `;
        let subject3 = `Password Reset Request`
        let body3 = `<strong>Dear ${name}</strong>
            <p>We received a request to reset the password associated with your account at E-learning. 
            To reset your password, please click on the link below:</p>

            <p>[Password Reset Link]</p>

            <p>If you did not initiate this request or believe it was made in error, you can safely ignore this email. 
            Your account security is important to us, and no changes will be made unless you confirm the reset request.</p>

            <strong>Thank you,</strong>
            <p>E-learning</p>
        `;
        let subject;
        let body;
        if (action) {
            subject = subject1;
            body = body1;
        } else if (action === 2) {
            subject = subject2;
            body = body2;
        } else if (action === 3) {
            subject = subject3;
            body = body3;
        };
        const resendy = new resend.Resend(process.env.RESEND_PASSKEY);
        const data = await resendy.emails.send({
            from: `Acme <${process.env.COMPANY_EMAIL}>`,
            to: [email],
            subject,
            html: `<div>${body}</div>`,
            text: "working fine"
        });
        console.log(data.error);
    } catch (error) {
        console.log(error);
    };
};

module.exports = { sendEmail };