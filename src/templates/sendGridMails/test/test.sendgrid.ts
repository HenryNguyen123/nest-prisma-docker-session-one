export const testMail = () => {
  const data = `
        <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>hello minh</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.5; }
              p { margin-bottom: 16px; }
            </style>
          </head>
          <body>
            <h2>mail send</h2>

            <p>Dòng 1: Đây là email test nội dung dài vừa phải.</p>
            <p>Dòng 2: Email được tạo thủ công để kiểm tra hiển thị trong Gmail.</p>
            <p>Dòng 3: Mỗi dòng đều có ý nghĩa để .</p>
            <p>Dòng 4: Đây chỉ là email thử nghiệm, không phải quảng cáo.</p>
            <p>Dòng 5: Nội dung email phải có ngữ cảnh rõ ràng.</p>
            <p>Dòng 6: Chúng tôi đang kiểm tra hệ thống gửi mail SendGrid.</p>
            <p>Dòng 7: Đây là đoạn văn bản bổ sung với nội dung khác nhau.</p>
            <p>Dòng 8: Các nội dung đa dạng giúp vượt qua bộ lọc spam của Gmail.</p>
            <p>Dòng 9: Email test kết thúc tại đây.</p>
            <p>Dòng 10: Cảm ơn đại ca đã kiểm tra!</p>
          </body>
        </html>
    `;
  return data;
};
