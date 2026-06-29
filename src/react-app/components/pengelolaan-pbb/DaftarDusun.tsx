import { Dusun } from "../../types"

interface DaftarDusunProps {
  dusun: Dusun[]
  searchTerm: string
  onSearchChange: (value: string) => void
  onTambahDusunClick: () => void
  onDusunClick: (dusunId: number) => void
  onRefresh: () => void
  isRefreshing: boolean
}

export function DaftarDusun({
  dusun,
  searchTerm,
  onSearchChange,
  onTambahDusunClick,
  onDusunClick,
  onRefresh,
  isRefreshing,
}: DaftarDusunProps) {
  const filteredDusun = dusun.filter((d) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      d.nama_dusun.toLowerCase().includes(searchLower) ||
      (d.nama_kepala_dusun || "").toLowerCase().includes(searchLower) ||
      (d.total_perangkat_desa || 0).toString().includes(searchLower)
    )
  })

  return (
    <>
      <div className="card mb-3">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h6 className="mb-0">Daftar Dusun</h6>
          <button className="btn btn-sm btn-primary" onClick={onTambahDusunClick}>
            <i className="bi bi-plus-circle me-1"></i>
            Tambah Dusun
          </button>
        </div>
      </div>
      <div className="card mb-2">
        <div className="card-body p-3">
          <div className="row align-items-center g-2">
            <div className="col-md-10">
              <div className="input-group">
                <span className="input-group-text" style={{ width: "40px" }}>
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  style={{ height: "50px" }}
                  placeholder="Cari dusun..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-2">
              <button
                className="btn btn-outline-secondary"
                style={{ width: "100%", height: "50px" }}
                onClick={onRefresh}
                disabled={isRefreshing}
              >
                <i className={`bi bi-arrow-clockwise ${isRefreshing ? "spin" : ""}`}></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      {isRefreshing ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Memuat data dusun...</p>
        </div>
      ) : filteredDusun.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <i className="bi bi-box text-muted" style={{ fontSize: "4rem" }}></i>
            <h4 className="mt-3">{searchTerm ? "Tidak Ada Dusun" : "Belum Ada Dusun"}</h4>
            <p className="text-muted">{searchTerm ? "Tidak ada dusun yang cocok dengan pencarian" : "Belum ada dusun yang terdaftar"}</p>
          </div>
        </div>
      ) : (
        <div className="table-container mx-auto" style={{ maxHeight: "500px", overflowY: "auto", maxWidth: "100%" }}>
          <table className="table table-hover">
            <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 1 }}>
              <tr>
                <th>Nama Dusun</th>
                <th>Kepala Dusun</th>
                <th>Total Perangkat Desa</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredDusun.map((d) => (
                <tr key={d.id}>
                  <td>{d.nama_dusun}</td>
                  <td>{d.nama_kepala_dusun || "Belum ada"}</td>
                  <td>
                    <span className="badge bg-info">
                      <i className="bi bi-person me-1"></i>
                      {d.total_perangkat_desa || 0} Orang
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-primary" onClick={() => onDusunClick(d.id)}>
                      <i className="bi bi-eye me-1"></i>
                      Lihat Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
