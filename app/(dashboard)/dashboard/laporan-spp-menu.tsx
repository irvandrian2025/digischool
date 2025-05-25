import Link from "next/link";
import { FileSearchOutlined } from "@ant-design/icons";

const LaporanSppMenu = () => (
  <Link href="/dashboard/laporan-spp-page" style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <FileSearchOutlined />
    <span>Laporan SPP</span>
  </Link>
);

export default LaporanSppMenu;