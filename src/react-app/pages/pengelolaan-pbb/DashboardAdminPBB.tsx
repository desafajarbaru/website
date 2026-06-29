import { useState, useEffect, useCallback } from "react"
import { Dusun, SuratPBB, Laporan, PerangkatDesa } from "../../types"
import { useAuth } from "../../contexts/AuthContext"
import { TabelSuratPBB } from "../../components/pengelolaan-pbb/TabelSuratPBB"
import { DetailSuratPBB } from "../../components/pengelolaan-pbb/DetailSuratPBB"
import { DetailDusunLaporan } from "../../components/pengelolaan-pbb/DetailDusunLaporan"
import { FormTambahSuratPBB } from "../../components/pengelolaan-pbb/FormTambahSuratPBB"
import { DaftarDusun } from "../../components/pengelolaan-pbb/DaftarDusun"
import { LaporanPBB } from "../../components/pengelolaan-pbb/LaporanPBB"
import { DetailDusunAdmin } from "../../components/pengelolaan-pbb/DetailDusunAdmin"
import { FormEditPerangkatDesa } from "../../components/pengelolaan-pbb/FormEditPerangkatDesa"
import { apiClient } from "../../utils/api"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import Swal from "sweetalert2"

export function DashboardAdminPBB() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<
    "dusun" | "surat" | "laporan" | "tambah-dusun" | "tambah-surat" | "detail-dusun" | "detail-perangkat" | "detail-laporan-dusun"
  >("dusun")
  const [dusun, setDusun] = useState<Dusun[]>([])
  const [suratPBB, setSuratPBB] = useState<SuratPBB[]>([])
  const [laporan, setLaporan] = useState<Laporan | null>(null)

  const [dusunForm, setDusunForm] = useState({ nama_dusun: "" })
  const [suratForm, setSuratForm] = useState({
    dusun_id: "",
    nomor_objek_pajak: "",
    nama_wajib_pajak: "",
    alamat_wajib_pajak: "",
    alamat_objek_pajak: "",
    luas_tanah: "",
    luas_bangunan: "",
    tahun_pajak: "2025",
    jumlah_pajak_terhutang: "",
    status_pembayaran: "belum_bayar",
  })

  const [selectedSurat, setSelectedSurat] = useState<SuratPBB | null>(null)
  const [activeYear, setActiveYear] = useState<number>(new Date().getFullYear())
  const [availableYears, setAvailableYears] = useState<number[]>([])
  const [isEditingDusun, setIsEditingDusun] = useState<boolean>(false)
  const [editDusunName, setEditDusunName] = useState<string>("")
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<Partial<SuratPBB>>({})
  const [selectedDusun, setSelectedDusun] = useState<Dusun | null>(null)
  const [selectedPerangkat, setSelectedPerangkat] = useState<PerangkatDesa | null>(null)
  const [perangkatForm, setPerangkatForm] = useState({
    nama_lengkap: "",
    password: "",
    id_dusun: "",
    jabatan: "",
  })

  const [searchDusun, setSearchDusun] = useState("")
  const [searchSuratPBB, setSearchSuratPBB] = useState("")
  const [searchStatistik, setSearchStatistik] = useState("")
  const [searchPerangkat, setSearchPerangkat] = useState("")
  const [filterStatusSurat, setFilterStatusSurat] = useState("semua")
  const [dusunTokens, setDusunTokens] = useState<{ tokenKepalaDusun: string; tokenKetuaRT: string } | null>(null)
  const [perangkatDesa, setPerangkatDesa] = useState<PerangkatDesa[]>([])
  const [selectedDusunId, setSelectedDusunId] = useState<string | null>(null)
  const [isRefreshingDusun, setIsRefreshingDusun] = useState(false)
  const [isRefreshingStatistik, setIsRefreshingStatistik] = useState(false)
  const [isRefreshingPerangkat, setIsRefreshingPerangkat] = useState(false)

  // Cache flags to prevent unnecessary fetches
  const [hasDusunFetched, setHasDusunFetched] = useState(false)
  const [hasSuratFetched, setHasSuratFetched] = useState(false)
  const [hasLaporanFetched, setHasLaporanFetched] = useState(false)

  // Helper function to get filtered surat PBB based on search and status filter
  const getFilteredSuratPBB = () => {
    return suratPBB.filter((surat) => {
      const searchLower = searchSuratPBB.toLowerCase()
      const matchesSearch = (
        surat.nomor_objek_pajak.toLowerCase().includes(searchLower) ||
        surat.nama_wajib_pajak.toLowerCase().includes(searchLower) ||
        (surat.nama_dusun || "").toLowerCase().includes(searchLower) ||
        (surat.tahun_pajak?.toString() || "").includes(searchLower)
      )

      const matchesStatus = filterStatusSurat === "semua" || surat.status_pembayaran === filterStatusSurat

      return matchesSearch && matchesStatus
    })
  }

  const exportToExcel = () => {
    const filteredData = getFilteredSuratPBB()

    const workbook = XLSX.utils.book_new()

    const headerInfo = [
      ["LAPORAN DATA SURAT PBB"],
      ["Sistem Pengelolaan Pajak Bumi dan Bangunan"],
      [""],
      [`Tanggal Export: ${new Date().toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}`],
      [`Tahun Pajak: ${activeYear}`],
      [`Total Data: ${filteredData.length} surat`],
      [`Filter Status: ${filterStatusSurat === "semua" ? "Semua Status" : filterStatusSurat === "belum_bayar" ? "Belum Bayar" : "Sudah Bayar"}`],
      [""],
    ]

    const dataRows = filteredData.map((s) => ({
      "NOP": s.nomor_objek_pajak,
      "Nama Wajib Pajak": s.nama_wajib_pajak,
      "Alamat Wajib Pajak": s.alamat_wajib_pajak,
      "Total Pajak Terhutang": Number(s.jumlah_pajak_terhutang),
      "Tahun Pajak": s.tahun_pajak,
      "Status Pembayaran": (s.status_pembayaran || "belum_bayar").replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    }))

    const worksheet = XLSX.utils.aoa_to_sheet(headerInfo)

    XLSX.utils.sheet_add_json(worksheet, dataRows, { origin: -1 })

    const colWidths = [
      { wch: 25 }, // NOP
      { wch: 30 }, // Nama Wajib Pajak
      { wch: 40 }, // Alamat Wajib Pajak
      { wch: 20 }, // Total Pajak Terhutang
      { wch: 12 }, // Tahun Pajak
      { wch: 18 }, // Status Pembayaran
    ]
    worksheet['!cols'] = colWidths

    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Surat PBB")

    const timestamp = new Date().toISOString().slice(0, 10)
    const statusText = filterStatusSurat === "semua" ? "semua" : filterStatusSurat
    XLSX.writeFile(workbook, `Laporan_Surat_PBB_${statusText}_${timestamp}.xlsx`)
  }

  const exportToPDF = () => {
    const filteredData = getFilteredSuratPBB()
    const doc = new jsPDF('landscape')

    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text("LAPORAN DATA SURAT PBB", doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' })

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text("Sistem Pengelolaan Pajak Bumi dan Bangunan", doc.internal.pageSize.getWidth() / 2, 22, { align: 'center' })

    doc.setFontSize(9)
    const currentDate = new Date().toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })
    doc.text(`Tanggal Export: ${currentDate}`, 14, 32)
    doc.text(`Tahun Pajak: ${activeYear}`, 14, 37)
    doc.text(`Total Data: ${filteredData.length} surat`, 14, 42)

    const statusText = filterStatusSurat === "semua" ? "Semua Status" : filterStatusSurat === "belum_bayar" ? "Belum Bayar" : "Sudah Bayar"
    doc.text(`Filter Status: ${statusText}`, 14, 47)

    doc.setLineWidth(0.5)
    doc.line(14, 50, doc.internal.pageSize.getWidth() - 14, 50)

    const tableColumn = [
      "NOP",
      "Nama Wajib Pajak",
      "Alamat Wajib Pajak",
      "Total Pajak Terhutang",
      "Tahun Pajak",
      "Status Pembayaran",
    ]

    const tableRows = filteredData.map((s) => [
      s.nomor_objek_pajak || "",
      s.nama_wajib_pajak || "",
      s.alamat_wajib_pajak || "",
      `Rp ${Number(s.jumlah_pajak_terhutang || 0).toLocaleString("id-ID")}`,
      s.tahun_pajak || "",
      (s.status_pembayaran || "belum_bayar").replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    ])

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 55,
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 10,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      tableWidth: 'auto',
      margin: { left: 10, right: 10 },
      didDrawPage: function(data) {
        doc.setFontSize(8)
        const pageCount = doc.internal.pages.length - 1
        const currentPage = data.pageNumber
        doc.text(
          `Halaman ${currentPage} dari ${pageCount}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        )
      }
    })

    const timestamp = new Date().toISOString().slice(0, 10)
    const statusFileName = filterStatusSurat === "semua" ? "semua" : filterStatusSurat
    doc.save(`Laporan_Surat_PBB_${statusFileName}_${timestamp}.pdf`)
  }

  const fetchActiveYear = useCallback(async () => {
    try {
      const data = await apiClient.get<{ active_year: number }>("/statistik/active-year")
      setActiveYear(data.active_year)
    } catch (error) {
      console.error("Error fetching active year:", error)
    }
  }, [])

  const setYear = async (year: number) => {
    try {
      await apiClient.post("/statistik/active-year", { year })
      setActiveYear(year)
      fetchDusun()
      fetchSuratPBB()
      fetchLaporan()
    } catch (error) {
      console.error("Error setting active year:", error)
      const msg = error instanceof Error ? error.message : "Gagal mengatur tahun aktif"
      Swal.fire({
        title: "Error",
        text: msg,
        icon: "error",
        timer: 3000,
        showConfirmButton: false,
      })
    }
  }

  const fetchDusun = useCallback(async () => {
    try {
      const data = await apiClient.get<Dusun[]>("/dusun")
      setDusun(data)
      setHasDusunFetched(true)
    } catch (error) {
      console.error("Error fetching dusun:", error)
    }
  }, [])

  const fetchSuratPBB = useCallback(async () => {
    try {
      const data = await apiClient.get<{ surat_pbb?: SuratPBB[]; active_year?: number } | SuratPBB[]>("/surat-pbb")
      if (Array.isArray(data)) {
        setSuratPBB(data)
      } else {
        setSuratPBB(data.surat_pbb || [])
        if (data.active_year) {
          setActiveYear(data.active_year)
        }
      }
      setHasSuratFetched(true)
    } catch (error) {
      console.error("Error fetching surat PBB:", error)
    }
  }, [])

  const fetchLaporan = useCallback(async () => {
    try {
      const data = await apiClient.get<Laporan>("/statistik/laporan")
      setLaporan(data)
      setHasLaporanFetched(true)
    } catch (error) {
      console.error("Error fetching laporan:", error)
    }
  }, [])

  useEffect(() => {
    const years = []
    for (let year = 2025; year <= 2050; year++) {
      years.push(year)
    }
    setAvailableYears(years)
    fetchActiveYear()
  }, [fetchActiveYear])

  useEffect(() => {
    setSuratForm(prev => ({ ...prev, tahun_pajak: activeYear.toString() }))
  }, [activeYear])

  // Fetch data only on first visit to each tab
  useEffect(() => {
    if (activeTab === "dusun" && !hasDusunFetched) fetchDusun()
    if (activeTab === "surat" && !hasSuratFetched) {
      fetchSuratPBB()
      if (!hasDusunFetched) fetchDusun() // Fetch dusun also for dropdown edits
    }
    if (activeTab === "laporan" && !hasLaporanFetched) fetchLaporan()
  }, [activeTab, fetchDusun, fetchSuratPBB, fetchLaporan, hasDusunFetched, hasSuratFetched, hasLaporanFetched])

  const openDusunDetail = async (dusunId: number) => {
    try {
      const data = await apiClient.get<Dusun>(`/dusun/${dusunId}`)
      setSelectedDusun(data)
      setIsEditingDusun(false)
      setActiveTab("detail-dusun")

      const tokenData = await apiClient.get<{ tokenKepalaDusun: string; tokenKetuaRT: string }>(`/dusun/${dusunId}/tokens`)
      setDusunTokens(tokenData)

      const perangkatData = await apiClient.get<PerangkatDesa[]>(`/perangkat-desa?dusun_id=${dusunId}`)
      setPerangkatDesa(perangkatData)
    } catch (error) {
      console.error("Error fetching dusun detail:", error)
    }
  }

  const openPerangkatDetail = (perangkat: PerangkatDesa) => {
    setSelectedPerangkat(perangkat)
    setPerangkatForm({
      nama_lengkap: perangkat.nama_lengkap,
      password: "",
      id_dusun: perangkat.id_dusun?.toString() || "",
      jabatan: perangkat.jabatan,
    })
    setActiveTab("detail-perangkat")
  }

  const handleCreateDusun = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiClient.post("/dusun", dusunForm)
      setActiveTab("dusun")
      setDusunForm({ nama_dusun: "" })
      fetchDusun()
      Swal.fire({
        title: "Berhasil!",
        text: "Dusun berhasil ditambahkan!",
        icon: "success",
        timer: 3000,
        showConfirmButton: false,
      })
    } catch (err) {
      console.error(err)
      const msg = err instanceof Error ? err.message : "Gagal menambahkan dusun"
      Swal.fire({
        title: "Error",
        text: msg,
        icon: "error",
        timer: 3000,
        showConfirmButton: false,
      })
    }
  }

  const handleCreateSurat = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiClient.post("/surat-pbb", {
        nomor_objek_pajak: suratForm.nomor_objek_pajak,
        nama_wajib_pajak: suratForm.nama_wajib_pajak,
        alamat_wajib_pajak: suratForm.alamat_wajib_pajak,
        alamat_objek_pajak: suratForm.alamat_objek_pajak,
        luas_tanah: Number(suratForm.luas_tanah),
        luas_bangunan: Number(suratForm.luas_bangunan),
        jumlah_pajak_terhutang: Number(suratForm.jumlah_pajak_terhutang),
        tahun_pajak: Number(suratForm.tahun_pajak),
        status_pembayaran: suratForm.status_pembayaran,
        id_dusun: Number(suratForm.dusun_id),
      })
      setActiveTab("surat")
      setSuratForm({
        dusun_id: "",
        nomor_objek_pajak: "",
        nama_wajib_pajak: "",
        alamat_wajib_pajak: "",
        alamat_objek_pajak: "",
        luas_tanah: "",
        luas_bangunan: "",
        tahun_pajak: activeYear.toString(),
        jumlah_pajak_terhutang: "",
        status_pembayaran: "belum_bayar",
      })
      fetchSuratPBB()
      Swal.fire({
        title: "Berhasil!",
        text: "Surat PBB berhasil ditambahkan!",
        icon: "success",
        timer: 3000,
        showConfirmButton: false,
      })
    } catch (err) {
      console.error(err)
      const msg = err instanceof Error ? err.message : "Gagal menambahkan surat PBB"
      Swal.fire({
        title: "Error",
        text: msg,
        icon: "error",
        timer: 3000,
        showConfirmButton: false,
      })
    }
  }

  const updatePerangkatDesa = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPerangkat) return

    try {
      const updateData: {
        nama_lengkap: string
        jabatan: string
        id_dusun: number
        password?: string
      } = {
        nama_lengkap: perangkatForm.nama_lengkap,
        jabatan: perangkatForm.jabatan,
        id_dusun: Number(perangkatForm.id_dusun),
      }

      if (perangkatForm.password.trim()) {
        updateData.password = perangkatForm.password
      }

      await apiClient.put(`/perangkat-desa/${selectedPerangkat.id}`, updateData)

      Swal.fire({
        title: "Berhasil!",
        text: "Data perangkat desa berhasil diperbarui!",
        icon: "success",
        timer: 3000,
        showConfirmButton: false,
      })
      setActiveTab("detail-dusun")
      if (selectedDusun) {
        openDusunDetail(selectedDusun.id)
      }
    } catch (err) {
      console.error(err)
      const msg = err instanceof Error ? err.message : "Gagal memperbarui data perangkat desa"
      Swal.fire({
        title: "Error",
        text: msg,
        icon: "error",
        timer: 3000,
        showConfirmButton: false,
      })
    }
  }

  const deletePerangkatDesa = async (perangkat?: PerangkatDesa) => {
    const targetPerangkat = perangkat || selectedPerangkat
    if (!targetPerangkat) return

    try {
      await apiClient.delete(`/perangkat-desa/${targetPerangkat.id}`)

      Swal.fire({
        title: "Berhasil!",
        text: "Perangkat desa berhasil dihapus!",
        icon: "success",
        timer: 3000,
        showConfirmButton: false,
      })
      setActiveTab("detail-dusun")
      if (selectedDusun) {
        openDusunDetail(selectedDusun.id)
      }
    } catch (err) {
      console.error(err)
      const msg = err instanceof Error ? err.message : "Gagal menghapus perangkat desa"
      Swal.fire({
        title: "Error",
        text: msg,
        icon: "error",
        timer: 3000,
        showConfirmButton: false,
      })
    }
  }

  const deleteDusun = async () => {
    if (!selectedDusun) return

    const result = await Swal.fire({
      title: "Konfirmasi Hapus",
      text: `Apakah Anda yakin ingin menghapus dusun "${selectedDusun.nama_dusun}"? Semua data terkait (surat PBB, perangkat desa, dll.) akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`,
      icon: "warning",
      showCancelButton: true,
      showCloseButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    })

    if (!result.isConfirmed) return

    try {
      await apiClient.delete(`/dusun/${selectedDusun.id}`)
      Swal.fire({
        title: "Berhasil!",
        text: "Dusun berhasil dihapus!",
        icon: "success",
        timer: 3000,
        showConfirmButton: false,
      })
      setActiveTab("dusun")
      fetchDusun()
    } catch (err) {
      console.error(err)
      const msg = err instanceof Error ? err.message : "Gagal menghapus dusun"
      Swal.fire({
        title: "Error",
        text: msg,
        icon: "error",
        timer: 3000,
        showConfirmButton: false,
      })
    }
  }

  const startEditDusun = () => {
    if (!selectedDusun) return
    setIsEditingDusun(true)
    setEditDusunName(selectedDusun.nama_dusun)
  }

  const saveEditDusun = async () => {
    if (!selectedDusun || !editDusunName.trim()) {
      Swal.fire({
        title: "Error",
        text: "Nama dusun tidak boleh kosong",
        icon: "error",
        timer: 3000,
        showConfirmButton: false,
      })
      return
    }

    try {
      await apiClient.put(`/dusun/${selectedDusun.id}`, { nama_dusun: editDusunName.trim() })
      Swal.fire({
        title: "Berhasil!",
        text: "Nama dusun berhasil diperbarui!",
        icon: "success",
        timer: 3000,
        showConfirmButton: false,
      })
      setIsEditingDusun(false)
      setEditDusunName("")
      openDusunDetail(selectedDusun.id)
    } catch (err) {
      console.error(err)
      const msg = err instanceof Error ? err.message : "Gagal memperbarui nama dusun"
      Swal.fire({
        title: "Error",
        text: msg,
        icon: "error",
        timer: 3000,
        showConfirmButton: false,
      })
    }
  }

  const cancelEditDusun = () => {
    setIsEditingDusun(false)
    setEditDusunName("")
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedSurat) return

    try {
      await apiClient.put(`/surat-pbb/${selectedSurat.id}`, {
        status_pembayaran: newStatus,
        tahun_pajak: selectedSurat.tahun_pajak,
      })
      setSelectedSurat({ ...selectedSurat, status_pembayaran: newStatus as SuratPBB["status_pembayaran"] })
      setEditForm({ ...editForm, status_pembayaran: newStatus as SuratPBB["status_pembayaran"] })

      Swal.fire({
        title: "Berhasil!",
        text: "Status pembayaran berhasil diperbarui",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      })
    } catch (err) {
      console.error("Error updating status:", err)
      Swal.fire({
        title: "Error",
        text: "Gagal memperbarui status pembayaran",
        icon: "error",
        timer: 3000,
        showConfirmButton: false,
      })
    }
  }

  const handleEditFormChange = async (field: string, value: string | number) => {
    setEditForm({ ...editForm, [field]: value })
    if (field === "id_dusun") {
      setSelectedSurat({ ...selectedSurat!, id_dusun: value as number })
      // Auto-submit dusun change
      try {
        await apiClient.put(`/surat-pbb/${selectedSurat!.id}`, { id_dusun: value })

        const dusunInfo = dusun.find(d => d.id === value)
        setSelectedSurat({
          ...selectedSurat!,
          id_dusun: value as number,
          nama_dusun: dusunInfo?.nama_dusun
        })

        Swal.fire({
          title: "Berhasil!",
          text: "Dusun surat PBB berhasil diperbarui",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        })
      } catch (error) {
        console.error("Error updating dusun:", error)
        const msg = error instanceof Error ? error.message : "Terjadi kesalahan saat memperbarui dusun"
        Swal.fire({
          title: "Error",
          text: msg,
          icon: "error",
        })
      }
    }
  }

  const handleSaveEdit = async () => {
    if (!selectedSurat) return

    try {
      await apiClient.put(`/surat-pbb/${selectedSurat.id}`, editForm)
      setSelectedSurat(editForm as SuratPBB)
      setIsEditing(false)
      fetchSuratPBB() // Refresh list to get updated dusun name if moved
      Swal.fire({
        title: "Berhasil!",
        text: "Surat PBB berhasil diperbarui",
        icon: "success",
        timer: 3000,
        showConfirmButton: false,
      })
    } catch (err) {
      console.error("Error updating surat:", err)
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan"
      Swal.fire({
        title: "Error",
        text: msg,
        icon: "error",
        timer: 3000,
        showConfirmButton: false,
      })
    }
  }

  const handleCancelEdit = () => {
    setEditForm(selectedSurat || {})
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (!selectedSurat) return

    const result = await Swal.fire({
      title: "Konfirmasi Hapus",
      text: `Apakah Anda yakin ingin menghapus surat PBB "${selectedSurat.nomor_objek_pajak}"? Tindakan ini tidak dapat dibatalkan.`,
      icon: "warning",
      showCancelButton: true,
      showCloseButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    })

    if (!result.isConfirmed) return

    try {
      await apiClient.delete(`/surat-pbb/${selectedSurat.id}`)
      Swal.fire({
        title: "Berhasil!",
        text: "Surat PBB berhasil dihapus!",
        icon: "success",
        timer: 3000,
        showConfirmButton: false,
      })
      setSelectedSurat(null)
      fetchSuratPBB()
    } catch (err) {
      console.error("Error deleting surat:", err)
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan"
      Swal.fire({
        title: "Error",
        text: msg,
        icon: "error",
        timer: 3000,
        showConfirmButton: false,
      })
    }
  }

  const handleRegenerateTokens = async () => {
    if (!selectedDusun) return
    const result = await Swal.fire({
      title: "Konfirmasi Regenerate Token",
      text: "Apakah Anda yakin ingin meregenerate token? Token lama akan tidak valid lagi.",
      icon: "warning",
      showCancelButton: true,
      showCloseButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Regenerate",
      cancelButtonText: "Batal",
    })

    if (result.isConfirmed) {
      try {
        const data = await apiClient.post<{ tokenKepalaDusun: string; tokenKetuaRT: string }>(`/dusun/${selectedDusun.id}/regenerate-tokens`)
        setDusunTokens({
          tokenKepalaDusun: data.tokenKepalaDusun,
          tokenKetuaRT: data.tokenKetuaRT,
        })
        Swal.fire({
          title: "Berhasil!",
          text: "Token berhasil diregenerate!",
          icon: "success",
          timer: 3000,
          showConfirmButton: false,
        })
      } catch (err) {
        console.error(err)
        const msg = err instanceof Error ? err.message : "Terjadi kesalahan"
        Swal.fire({
          title: "Error",
          text: msg,
          icon: "error",
          confirmButtonText: "OK",
        })
      }
    }
  }

  return (
    <div className="container-wide">
      <div className="dashboard-header">
        <div>
          <h2>Dashboard Pengelolaan PBB</h2>
          <p className="text-muted mb-0 small">{user?.nama_lengkap} (Admin)</p>
        </div>
        <div className="d-flex align-items-center gap-3" style={{ padding: "0.25rem 0" }}>
          <div className="d-flex align-items-center gap-2">
            <label className="form-label mb-0 text-muted small">Tahun Aktif:</label>
            <select className="form-select form-select-sm" style={{ width: "auto", minWidth: "100px" }} value={activeYear} onChange={(e) => setYear(parseInt(e.target.value))}>
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <ul className="nav nav-tabs mb-3" style={{ backgroundColor: "#fff", padding: "0.5rem 1rem", borderRadius: "4px", border: "1px solid #dee2e6" }}>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "dusun" ? "active" : ""}`} onClick={() => setActiveTab("dusun")} style={{ border: "none", fontSize: "0.9rem" }}>
            <i className="bi bi-house me-2"></i>
            Dusun
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "surat" ? "active" : ""}`} onClick={() => setActiveTab("surat")} style={{ border: "none", fontSize: "0.9rem" }}>
            <i className="bi bi-file-text me-2"></i>
            Surat PBB
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "laporan" ? "active" : ""}`} onClick={() => setActiveTab("laporan")} style={{ border: "none", fontSize: "0.9rem" }}>
            <i className="bi bi-bar-chart me-2"></i>
            Laporan
          </button>
        </li>
      </ul>

      {activeTab === "dusun" && (
        <DaftarDusun
          dusun={dusun}
          searchTerm={searchDusun}
          onSearchChange={setSearchDusun}
          onTambahDusunClick={() => setActiveTab("tambah-dusun")}
          onDusunClick={openDusunDetail}
          onRefresh={async () => {
            setIsRefreshingDusun(true)
            await fetchDusun()
            setTimeout(() => setIsRefreshingDusun(false), 500)
          }}
          isRefreshing={isRefreshingDusun}
        />
      )}

      {activeTab === "surat" && (
        <>
          {!selectedSurat ? (
            <>
              <div className="card mb-3">
                <div className="card-header">
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
                    <h6 className="mb-0">Daftar Surat PBB</h6>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-success"
                        onClick={async () => {
                          const filteredData = getFilteredSuratPBB()
                          if (filteredData.length === 0) {
                            await Swal.fire({
                              title: "Tidak Dapat Export",
                              text: "Tidak ada data surat PBB yang dapat diexport. Silakan sesuaikan filter atau pencarian Anda.",
                              icon: "warning",
                              confirmButtonText: "OK",
                            })
                            return
                          }

                          const statusText = filterStatusSurat === "semua" ? "Semua Status" : filterStatusSurat === "belum_bayar" ? "Belum Bayar" : "Sudah Bayar"
                          const result = await Swal.fire({
                            title: "Pilih Format Export",
                            html: `
                              <p>Pilih format file untuk export data Surat PBB</p>
                              <div class="text-start mt-3" style="background: #f8f9fa; padding: 12px; border-radius: 6px; font-size: 0.9em;">
                                <p class="mb-1"><strong>Data yang akan diexport:</strong></p>
                                <p class="mb-1">• Total: <strong>${filteredData.length}</strong> surat</p>
                                <p class="mb-1">• Status: <strong>${statusText}</strong></p>
                                <p class="mb-0">• Tahun: <strong>${activeYear}</strong></p>
                              </div>
                            `,
                            icon: "question",
                            showCancelButton: true,
                            showCloseButton: true,
                            confirmButtonText: '<i class="bi bi-file-earmark-excel me-1"></i> Excel',
                            cancelButtonText: '<i class="bi bi-file-earmark-pdf me-1"></i> PDF',
                            confirmButtonColor: "#28a745",
                            cancelButtonColor: "#dc3545",
                            reverseButtons: true,
                          })

                          if (result.isConfirmed) {
                            exportToExcel()
                            Swal.fire({
                              title: "Berhasil!",
                              text: `File Excel dengan ${filteredData.length} data berhasil didownload!`,
                              icon: "success",
                              timer: 3000,
                              showConfirmButton: false,
                            })
                          } else if (result.dismiss === "cancel") {
                            exportToPDF()
                            Swal.fire({
                              title: "Berhasil!",
                              text: `File PDF dengan ${filteredData.length} data berhasil didownload!`,
                              icon: "success",
                              timer: 3000,
                              showConfirmButton: false,
                            })
                          }
                        }}
                      >
                        <i className="bi bi-download me-1"></i>
                        Export
                      </button>
                      <button className="btn btn-sm btn-primary" onClick={() => setActiveTab("tambah-surat")}>
                        <i className="bi bi-plus-circle me-1"></i>
                        Tambah Surat
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <TabelSuratPBB suratPBB={suratPBB} searchTerm={searchSuratPBB} onSearchChange={setSearchSuratPBB} onSuratClick={setSelectedSurat} showDusunColumn={true} onRefresh={fetchSuratPBB} filterStatus={filterStatusSurat} onFilterStatusChange={setFilterStatusSurat} />
            </>
          ) : (
            <DetailSuratPBB
              surat={selectedSurat}
              isEditing={isEditing}
              editForm={editForm}
              onEditFormChange={handleEditFormChange}
              onSaveEdit={handleSaveEdit}
              onCancelEdit={handleCancelEdit}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              onBack={() => setSelectedSurat(null)}
              onStartEdit={() => {
                setIsEditing(true)
                setEditForm(selectedSurat)
              }}
              showAdminActions={true}
              isPerangkatDesa={false}
              dusunOptions={dusun}
            />
          )}
        </>
      )}

      {activeTab === "laporan" && laporan && (
        <LaporanPBB
          laporan={laporan}
          searchTerm={searchStatistik}
          onSearchChange={setSearchStatistik}
          onRefresh={async () => {
            setIsRefreshingStatistik(true)
            await fetchLaporan()
            setTimeout(() => setIsRefreshingStatistik(false), 500)
          }}
          isRefreshing={isRefreshingStatistik}
          onDetailClick={(dusunId) => {
            setSelectedDusunId(dusunId)
            setActiveTab("detail-laporan-dusun")
          }}
        />
      )}

      {activeTab === "tambah-dusun" && (
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Tambah Dusun Baru</h6>
            <button className="btn btn-sm btn-secondary" onClick={() => setActiveTab("dusun")}>
              <i className="bi bi-arrow-left me-1"></i>
              Kembali ke Daftar
            </button>
          </div>
          <div className="card-body">
            <form onSubmit={handleCreateDusun}>
              <div className="mb-3">
                <label className="form-label">
                  Nama Dusun <span className="text-danger">*</span>
                </label>
                <input type="text" className="form-control" value={dusunForm.nama_dusun} onChange={(e) => setDusunForm({ ...dusunForm, nama_dusun: e.target.value })} required />
              </div>
              <div className="alert alert-info">
                <i className="bi bi-info-circle me-2"></i>
                Setelah dusun dibuat, token untuk registrasi perangkat desa akan ditampilkan. Simpan token tersebut untuk diberikan kepada perangkat desa.
              </div>
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary">
                  <i className="bi bi-save me-1"></i>
                  Simpan
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setActiveTab("dusun")}>
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === "tambah-surat" && (
        <FormTambahSuratPBB
          suratForm={suratForm}
          onFormChange={(field, value) => setSuratForm({ ...suratForm, [field]: value })}
          onSubmit={handleCreateSurat}
          onCancel={() => setActiveTab("surat")}
          showDusunField={true}
          dusunOptions={dusun}
        />
      )}

      {activeTab === "detail-dusun" && selectedDusun && (
        <DetailDusunAdmin
          selectedDusun={selectedDusun}
          dusunTokens={dusunTokens}
          perangkatDesa={perangkatDesa}
          searchPerangkat={searchPerangkat}
          onSearchPerangkatChange={setSearchPerangkat}
          isRefreshingPerangkat={isRefreshingPerangkat}
          isEditingDusun={isEditingDusun}
          editDusunName={editDusunName}
          onEditDusunNameChange={setEditDusunName}
          onStartEditDusun={startEditDusun}
          onSaveEditDusun={saveEditDusun}
          onCancelEditDusun={cancelEditDusun}
          onDeleteDusun={deleteDusun}
          onBack={() => {
            setActiveTab("dusun")
            setDusunTokens(null)
          }}
          onEditPerangkat={openPerangkatDetail}
          onDeletePerangkat={(perangkat) => {
            Swal.fire({
              title: "Konfirmasi Hapus",
              text: `Apakah Anda yakin ingin menghapus perangkat desa "${perangkat.nama_lengkap}"? Tindakan ini tidak dapat dibatalkan.`,
              icon: "warning",
              showCancelButton: true,
              showCloseButton: true,
              confirmButtonColor: "#d33",
              cancelButtonColor: "#3085d6",
              confirmButtonText: "Ya, Hapus",
              cancelButtonText: "Batal",
            }).then((result) => {
              if (result.isConfirmed) {
                deletePerangkatDesa(perangkat)
              }
            })
          }}
          onRegenerateTokens={handleRegenerateTokens}
          onRefreshPerangkat={async () => {
            setIsRefreshingPerangkat(true)
            await openDusunDetail(selectedDusun.id)
            setTimeout(() => setIsRefreshingPerangkat(false), 500)
          }}
        />
      )}

      {activeTab === "detail-perangkat" && selectedPerangkat && (
        <FormEditPerangkatDesa
          selectedPerangkat={selectedPerangkat}
          dusunOptions={dusun}
          perangkatForm={perangkatForm}
          onFormChange={(field, value) => setPerangkatForm({ ...perangkatForm, [field]: value })}
          onSubmit={updatePerangkatDesa}
          onCancel={() => setActiveTab("detail-dusun")}
        />
      )}

      {activeTab === "detail-laporan-dusun" && selectedDusunId && <DetailDusunLaporan dusunId={selectedDusunId} onBack={() => setActiveTab("laporan")} />}
    </div>
  )
}
