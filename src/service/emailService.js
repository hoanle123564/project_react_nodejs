const nodemailer = require('nodemailer');
require('dotenv').config()

const sendSimpleEmail = (dataSend) => {

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_APP,
            pass: process.env.EMAIL_APP_PASSWORD  // app password
        }
    });

    let mailOptions = {
        from: `"LIFE CARE " <${process.env.EMAIL_APP}>`,
        to: dataSend.reciverEmail,
        subject: 'THÔNG BÁO ĐẶT LỊCH KHÁM BỆNH ONLINE',
        html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h3>Xin chào ${dataSend.patientName}!</h3>
                    <p>
                        Bạn nhận được email này vì đã đặt lịch khám bệnh online trên 
                        <b>LIFE CARE</b>.
                    </p>

                    <p><b>Thông tin đặt lịch khám bệnh:</b></p>
                    <div><b>Thời gian:</b> ${dataSend.time}</div>
                    <div><b>Bác sĩ:</b> ${dataSend.doctorName}</div>

                    <p>
                        Nếu các thông tin trên là đúng sự thật, vui lòng click vào đường link bên dưới
                        để xác nhận và hoàn tất thủ tục đặt lịch khám bệnh.
                    </p>

                    <div style="margin: 15px 0;">
                        <a href="${dataSend.redirectLink}" target="_blank"
                           style="
                                display:inline-block;
                                background-color:#28a745;
                                color:#fff;
                                padding:10px 20px;
                                border-radius:5px;
                                text-decoration:none;
                                font-weight:bold;
                           ">
                            Xác nhận lịch khám
                        </a>
                    </div>

                    <div>Xin chân thành cảm ơn!</div>
                </div>
            `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) return console.log(error);
        console.log('Email sent: ' + info.response);
    });
}

module.exports = {
    sendSimpleEmail
};
