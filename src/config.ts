/** Đặt địa chỉ email hoặc link Google Form để nhận báo lỗi câu hỏi. Để trống sẽ mở ứng dụng email không có người nhận. */
export const REPORT_EMAIL = "";
export const REPORT_FORM_URL = "";

export function reportHref(context: string): string {
  if (REPORT_FORM_URL) return REPORT_FORM_URL;
  const subject = encodeURIComponent(`Báo lỗi câu hỏi: ${context}`);
  const body = encodeURIComponent(`Nội dung cần sửa:\n\n(Trang: ${location.href})`);
  return `mailto:${REPORT_EMAIL}?subject=${subject}&body=${body}`;
}
