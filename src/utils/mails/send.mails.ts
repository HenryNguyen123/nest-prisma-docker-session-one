import sgMail from '@sendgrid/mail';

export interface sendMailType {
  mail: string;
  name?: string;
  subject: string;
  html: string;
}
export const sendMail = async (props: sendMailType) => {
  try {
    const key: string = process.env.SENDGRID_API_KEY ?? '';
    // const mailForm: string = process.env.SENDGRID_MAIL_NOREPLY ?? '';
    sgMail.setApiKey(key);
    const msg = {
      to: props.mail,
      from: {
        email: 'nhokkudo143@gmail.com',
        name: props.name ?? 'MinhNhat Shop',
      },
      subject: props.subject,
      html: props.html,
    };
    await sgMail.send(msg);
    console.log('mail->>>>>>send');
  } catch (error: unknown) {
    console.log(error);
  }
};
