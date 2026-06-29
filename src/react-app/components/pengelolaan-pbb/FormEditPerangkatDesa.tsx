import { Dusun, PerangkatDesa } from "../../types"

interface FormEditPerangkatDesaProps {
  selectedPerangkat: PerangkatDesa
  dusunOptions: Dusun[]
  perangkatForm: {
    nama_lengkap: string
    password: string
    id_dusun: string
    jabatan: string
  }
  onFormChange: (field: string, value: string) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
}

export function FormEditPerangkatDesa({
  selectedPerangkat,
  dusunOptions,
  perangkatForm,
  onFormChange,
  onSubmit,
  onCancel,
}: FormEditPerangkatDesaProps) {
  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h6 className="mb-0">Edit Perangkat Desa ({selectedPerangkat.nama_lengkap})</h6>
        <button className="btn btn-sm btn-secondary" onClick={onCancel}>
          <i className="bi bi-arrow-left me-1"></i>
          Kembali ke Detail Dusun
        </button>
      </div>
      <div className="card-body">
        <form onSubmit={onSubmit}>
          <div className="mb-3">
            <label className="form-label">
              Nama Lengkap <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              value={perangkatForm.nama_lengkap}
              onChange={(e) => onFormChange("nama_lengkap", e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password Baru (kosongkan jika tidak ingin mengubah)</label>
            <input
              type="password"
              className="form-control"
              value={perangkatForm.password}
              onChange={(e) => onFormChange("password", e.target.value)}
              placeholder="Masukkan password baru atau kosongkan"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">
              Jabatan <span className="text-danger">*</span>
            </label>
            <select
              className="form-select"
              value={perangkatForm.jabatan}
              onChange={(e) => onFormChange("jabatan", e.target.value)}
              required
            >
              <option value="kepala_dusun">Kepala Dusun</option>
              <option value="ketua_rt">Ketua RT</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">
              Dusun <span className="text-danger">*</span>
            </label>
            <select
              className="form-select"
              value={perangkatForm.id_dusun}
              onChange={(e) => onFormChange("id_dusun", e.target.value)}
              required
            >
              <option value="">Pilih Dusun</option>
              {dusunOptions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nama_dusun}
                </option>
              ))}
            </select>
          </div>
          <div className="d-flex gap-2 mt-4">
            <button type="submit" className="btn btn-primary">
              <i className="bi bi-save me-1"></i>
              Simpan Perubahan
            </button>
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
