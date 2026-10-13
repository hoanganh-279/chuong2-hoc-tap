import { Compass } from "@phosphor-icons/react";
import { ButtonLink, EmptyState } from "../components/ui";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20">
      <EmptyState
        icon={<Compass size="2.25rem" />}
        title="Không tìm thấy trang"
        body="Đường dẫn có thể đã thay đổi. Quay về danh sách chủ đề để tiếp tục học."
        action={<ButtonLink to="/">Về trang chủ đề</ButtonLink>}
      />
    </div>
  );
}
