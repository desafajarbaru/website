import { Laporan } from "../../types"

interface LaporanPBBProps {
  laporan: Laporan
  searchTerm: string
  onSearchChange: (value: string) => void
  onRefresh: () => void
  isRefreshing: boolean
  onDetailClick: (dusunId: string) => void
}

export function LaporanPBB({
  laporan,
  searchTerm,
  onSearchChange,
  onRefresh,
  isRefreshing,
  onDetailClick,
}: LaporanPBBProps) {
  const filteredStatistik =
    laporan.statistik_per_dusun.filter((stat) => {
      const searchLower = searchTerm.toLowerCase()
      return (
        stat.nama_dusun.toLowerCase().includes(searchLower) ||
        (stat.total_surat || 0).toString().includes(searchLower) ||
        (stat.persentase_pembayaran || 0).toString().includes(searchLower)
      )
    }) || []

  const totalPajakTerbayar = laporan.statistik_per_dusun.reduce(
    (sum, stat) => sum + (stat.total_pajak_dibayar || 0),
    0
  )

  return (
    <div>
      <div className="card mb-3">
        <div className="card-header">
          <h6 className="mb-0">
            <i className="bi bi-bar-chart me-2"></i>
            Statistik Keseluruhan
          </h6>
        </div>
        <div className="card-body">
          <div className="row g-1 g-md-2">
            <div className="col-md-4">
              <div className="card h-100">
                <div className="card-body p-1 p-md-3">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <div className="text-muted small mb-1">Total Pajak Terhutang</div>
                      <div className="h4 mb-0">
                        Rp {laporan.total_pajak_terhutang_keseluruhan.toLocaleString("id-ID")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100">
                <div className="card-body p-1 p-md-3">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <div className="text-muted small mb-1">Total Pajak Terbayar</div>
                      <div className="h4 mb-0">
                        Rp {totalPajakTerbayar.toLocaleString("id-ID")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100">
                <div className="card-body p-1 p-md-3">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <div className="text-muted small mb-1">Persentase Pembayaran</div>
                      <div className="h4 mb-0 font-semibold text-success">
                        {laporan.persentase_pembayaran_keseluruhan.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100">
                <div className="card-body p-1 p-md-3">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <div className="text-muted small mb-1">Total Surat</div>
                      <div className="h4 mb-0">{laporan.total_surat_keseluruhan}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100">
                <div className="card-body p-1 p-md-3">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <div className="text-muted small mb-1">Surat Sudah Lunas</div>
                      <div className="h4 mb-0 text-success">{laporan.total_surat_dibayar_keseluruhan}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100">
                <div className="card-body p-1 p-md-3">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <div className="text-muted small mb-1">Surat Belum Dibayar</div>
                      <div className="h4 mb-0 text-danger">{laporan.total_surat_belum_bayar_keseluruhan}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-header">
          <h6 className="mb-0">
            <i className="bi bi-bar-chart me-2"></i>
            Statistik Per Dusun
          </h6>
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
                  placeholder="Cari statistik dusun..."
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
          <p className="mt-3 text-muted">Memuat data statistik...</p>
        </div>
      ) : filteredStatistik.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <i className="bi bi-inbox text-muted" style={{ fontSize: "4rem" }}></i>
            <h4 className="mt-3">{searchTerm ? "Tidak Ada Statistik" : "Belum Ada Data Statistik"}</h4>
            <p className="text-muted">
              {searchTerm ? "Tidak ada statistik dusun yang cocok dengan pencarian" : "Belum ada data statistik dusun"}
            </p>
          </div>
        </div>
      ) : (
        <div className="table-container mx-auto" style={{ maxHeight: "500px", overflowY: "auto", maxWidth: "100%" }}>
          <table className="table table-hover">
            <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 1 }}>
              <tr>
                <th>Nama Dusun</th>
                <th>Total Surat</th>
                <th>Persentase</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredStatistik.map((stat) => (
                <tr key={stat.id} style={{ cursor: "pointer" }}>
                  <td>{stat.nama_dusun}</td>
                  <td>
                    <span className="badge bg-info">{stat.total_surat || 0}</span>
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="progress flex-grow-1 me-2" style={{ height: "20px", minWidth: "80px" }}>
                        <div
                          className="progress-bar bg-success"
                          role="progressbar"
                          style={{ width: `${stat.persentase_pembayaran || 0}%` }}
                          aria-valuenow={stat.persentase_pembayaran || 0}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        >
                          {(stat.persentase_pembayaran || 0).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => onDetailClick(stat.id.toString())}
                      >
                        <i className="bi bi-eye me-1"></i>
                        Detail
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
