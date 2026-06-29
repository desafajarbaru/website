import { Dusun, PerangkatDesa } from "../../types"
import Swal from "sweetalert2"

interface DetailDusunAdminProps {
  selectedDusun: Dusun
  dusunTokens: { tokenKepalaDusun: string; tokenKetuaRT: string } | null
  perangkatDesa: PerangkatDesa[]
  searchPerangkat: string
  onSearchPerangkatChange: (value: string) => void
  isRefreshingPerangkat: boolean
  isEditingDusun: boolean
  editDusunName: string
  onEditDusunNameChange: (value: string) => void
  onStartEditDusun: () => void
  onSaveEditDusun: () => void
  onCancelEditDusun: () => void
  onDeleteDusun: () => void
  onBack: () => void
  onEditPerangkat: (perangkat: PerangkatDesa) => void
  onDeletePerangkat: (perangkat: PerangkatDesa) => void
  onRegenerateTokens: () => void
  onRefreshPerangkat: () => void
}

export function DetailDusunAdmin({
  selectedDusun,
  dusunTokens,
  perangkatDesa,
  searchPerangkat,
  onSearchPerangkatChange,
  isRefreshingPerangkat,
  isEditingDusun,
  editDusunName,
  onEditDusunNameChange,
  onStartEditDusun,
  onSaveEditDusun,
  onCancelEditDusun,
  onDeleteDusun,
  onBack,
  onEditPerangkat,
  onDeletePerangkat,
  onRegenerateTokens,
  onRefreshPerangkat,
}: DetailDusunAdminProps) {
  const filteredPerangkat = perangkatDesa.filter((p) => {
    const searchLower = searchPerangkat.toLowerCase()
    return (
      p.nama_lengkap.toLowerCase().includes(searchLower) ||
      p.jabatan.toLowerCase().includes(searchLower)
    )
  })

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    Swal.fire({
      title: "Berhasil!",
      text: "Token berhasil disalin!",
      icon: "success",
      confirmButtonText: "OK",
      timer: 1500,
      showConfirmButton: false,
    })
  }

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h6 className="mb-0">Detail Dusun</h6>
        <button className="btn btn-sm btn-secondary" onClick={onBack}>
          <i className="bi bi-arrow-left me-1"></i>
          Kembali ke Daftar
        </button>
      </div>
      <div className="card-body">
        <div className="row g-4">
          <div className="col-12">
            <div className="card border-primary mb-3">
              <div className="card-header bg-primary text-white">
                <h6 className="mb-0">
                  <i className="bi bi-info-circle me-2"></i>
                  Informasi Dusun
                </h6>
              </div>
              <div className="card-body">
                {isEditingDusun ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      onSaveEditDusun()
                    }}
                  >
                    <div className="mb-3">
                      <label className="form-label">
                        Nama Dusun <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={editDusunName}
                        onChange={(e) => onEditDusunNameChange(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>
                    <div className="d-flex gap-2">
                      <button type="submit" className="btn btn-primary">
                        <i className="bi bi-save me-1"></i>
                        Simpan
                      </button>
                      <button type="button" className="btn btn-secondary" onClick={onCancelEditDusun}>
                        Batal
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="row g-3">
                    <div className="col-md-6">
                      <strong>Nama Dusun:</strong>
                      <p className="mb-0">{selectedDusun.nama_dusun}</p>
                    </div>
                    <div className="col-md-6 d-flex justify-content-between align-items-start">
                      <div>
                        <strong>Kepala Dusun:</strong>
                        <p className="mb-0">{selectedDusun.nama_kepala_dusun || "Belum ada"}</p>
                      </div>
                      <div className="d-flex flex-column gap-2">
                        <button className="btn btn-warning btn-sm" onClick={onStartEditDusun}>
                          <i className="bi bi-pencil me-1"></i>
                          Edit Dusun
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={onDeleteDusun}>
                          <i className="bi bi-trash me-1"></i>
                          Hapus Dusun
                        </button>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <strong>Total Perangkat Desa:</strong>
                      <p className="mb-0">
                        <span className="badge bg-info">
                          <i className="bi bi-people me-1"></i>
                          {selectedDusun.total_perangkat_desa || 0} Perangkat
                        </span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-12">
            <div className="card border-warning mb-3">
              <div className="card-header bg-warning text-dark d-flex justify-content-between align-items-center">
                <h6 className="mb-0">
                  <i className="bi bi-key me-2"></i>
                  Token Registrasi Perangkat Desa
                </h6>
                <button className="btn btn-sm btn-outline-dark" onClick={onRegenerateTokens}>
                  <i className="bi bi-arrow-clockwise me-1"></i>
                  Regenerate Token
                </button>
              </div>
              <div className="card-body">
                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  Token ini digunakan oleh perangkat desa untuk mendaftar ke sistem. Berikan token yang sesuai dengan jabatan kepada calon perangkat desa.
                </div>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold text-success">
                      <i className="bi bi-person me-1"></i>
                      Token Kepala Dusun
                    </label>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control font-monospace"
                        value={dusunTokens?.tokenKepalaDusun || "Token sudah digunakan"}
                        readOnly
                      />
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => copyToClipboard(dusunTokens?.tokenKepalaDusun || "")}
                        disabled={!dusunTokens?.tokenKepalaDusun}
                      >
                        <i className="bi bi-clipboard me-1"></i>
                        Salin
                      </button>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold text-warning">
                      <i className="bi bi-people me-1"></i>
                      Token Ketua RT
                    </label>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control font-monospace"
                        value={dusunTokens?.tokenKetuaRT || "Token tidak tersedia"}
                        readOnly
                      />
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => copyToClipboard(dusunTokens?.tokenKetuaRT || "")}
                        disabled={!dusunTokens?.tokenKetuaRT}
                      >
                        <i className="bi bi-clipboard me-1"></i>
                        Salin
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12">
            <div className="card mb-3">
              <div className="card-header">
                <h6 className="mb-0">
                  <i className="bi bi-people me-2"></i>
                  Daftar Perangkat Desa
                </h6>
              </div>
            </div>
            <>
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
                          placeholder="Cari perangkat desa..."
                          value={searchPerangkat}
                          onChange={(e) => onSearchPerangkatChange(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="col-md-2">
                      <button
                        className="btn btn-outline-secondary"
                        style={{ width: "100%", height: "50px" }}
                        onClick={onRefreshPerangkat}
                        disabled={isRefreshingPerangkat}
                      >
                        <i className={`bi bi-arrow-clockwise ${isRefreshingPerangkat ? "spin" : ""}`}></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              {isRefreshingPerangkat ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3 text-muted">Memuat data perangkat desa...</p>
                </div>
              ) : (
                <div className="table-container mx-auto" style={{ maxHeight: "500px", overflowY: "auto", maxWidth: "100%" }}>
                  <table className="table table-hover">
                    <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 1 }}>
                      <tr>
                        <th>Nama Lengkap</th>
                        <th>Jabatan</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPerangkat.map((perangkat: PerangkatDesa) => (
                        <tr key={perangkat.id}>
                          <td>{perangkat.nama_lengkap}</td>
                          <td>
                            <span
                              className={`badge bg-${perangkat.jabatan === "kepala_dusun" ? "success" : "warning"}`}
                            >
                              {perangkat.jabatan === "kepala_dusun" ? "Kepala Dusun" : "Ketua RT"}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() => onEditPerangkat(perangkat)}
                              >
                                <i className="bi bi-pencil me-1"></i>
                                Edit
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => onDeletePerangkat(perangkat)}
                              >
                                <i className="bi bi-trash me-1"></i>
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          </div>
        </div>
      </div>
    </div>
  )
}
