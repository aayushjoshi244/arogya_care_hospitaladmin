import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Activity, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  AlertCircle,
  HelpCircle,
  Stethoscope,
  RefreshCw,
  Phone,
  DollarSign,
  UserX,
  QrCode,
  Printer,
  X
} from 'lucide-react';

const LiveBoard = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctorQueues, setDoctorQueues] = useState([]);
  const [hospitalInfo, setHospitalInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);

  // Filters
  const [doctorFilter, setDoctorFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLiveQueue();
  }, []);

  const fetchLiveQueue = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await api.get('/operations/live-queue');
      if (res.success) {
        setAppointments(res.data?.appointments || []);
        setDoctorQueues(res.data?.doctorQueues || []);
      }
      const profRes = await api.get('/profile');
      if (profRes.success) {
        setHospitalInfo(profRes.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch live queue logs from server');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintQr = () => {
    if (!hospitalInfo?.hospital_id) return;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${hospitalInfo.name} - Desk Check-in QR</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; text-align: center; padding: 40px; margin: 0; background: #f8fafc; color: #0f172a; }
            .card { background: white; border-radius: 24px; padding: 40px; max-width: 400px; margin: 0 auto; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 2px solid #e2e8f0; }
            h1 { margin: 0 0 8px 0; font-size: 24px; color: #0f172a; }
            p { margin: 0 0 24px 0; font-size: 13px; color: #64748b; }
            .qr-box { background: #f1f5f9; padding: 20px; border-radius: 20px; display: inline-block; margin-bottom: 24px; }
            .badge { background: #0A6E6E; color: white; padding: 6px 16px; border-radius: 20px; font-weight: bold; font-size: 12px; display: inline-block; margin-bottom: 16px; }
            .id-text { font-size: 12px; font-weight: bold; color: #0A6E6E; letter-spacing: 1px; }
            .footer { font-size: 11px; color: #94a3b8; margin-top: 16px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="badge">AROGYA CARE OPD CHECK-IN</div>
            <h1>${hospitalInfo.name}</h1>
            <p>${hospitalInfo.address || ''}, ${hospitalInfo.city || ''}</p>
            <div class="qr-box">
              <svg id="qr"></svg>
            </div>
            <div class="id-text">FACILITY ID: ${hospitalInfo.hospital_id}</div>
            <div class="footer">Scan with Arogya Patient App to mark OPD check-in</div>
          </div>
          <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
          <script>
            QRCode.toString('${hospitalInfo.hospital_id}', { type: 'svg', width: 220, margin: 1 }, function (err, svg) {
              if (!err) {
                document.getElementById('qr').outerHTML = svg;
                setTimeout(() => window.print(), 300);
              }
            });
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleUpdateStatus = async (appId, status) => {
    setUpdatingId(appId);
    setError('');
    setMessage('');
    try {
      const res = await api.put(`/operations/appointments/${appId}/status`, { status });
      if (res.success) {
        setMessage(res.message || `Status updated to ${status} successfully.`);
        fetchLiveQueue();
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to update patient operational status');
    } finally {
      setUpdatingId(null);
    }
  };

  // Queue Statistics sums
  const stats = {
    total: appointments.length,
    waiting: appointments.filter(a => a.consultation_status === 'PENDING').length,
    checkedIn: appointments.filter(a => a.consultation_status === 'CHECKED_IN').length,
    completed: appointments.filter(a => a.consultation_status === 'COMPLETED').length,
    absent: appointments.filter(a => a.consultation_status === 'ABSENT').length,
  };

  const getConsultationBadge = (status) => {
    switch (status) {
      case 'CHECKED_IN':
        return (
          <span className="inline-flex items-center gap-1 bg-info-bg text-info-text border border-info/20 px-2.5 py-1 rounded-full text-[10px] font-bold">
            <UserCheck size={10} /> Checked In
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 bg-warning-bg text-warning-text border border-warning/20 px-2.5 py-1 rounded-full text-[10px] font-bold animate-pulse">
            <Clock size={10} /> In Consultation
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 bg-success-bg text-success-text border border-success/20 px-2.5 py-1 rounded-full text-[10px] font-bold">
            <CheckCircle2 size={10} /> Completed
          </span>
        );
      case 'ABSENT':
        return (
          <span className="inline-flex items-center gap-1 bg-error-bg text-error-text border border-error/20 px-2.5 py-1 rounded-full text-[10px] font-bold">
            <UserX size={10} /> No Show
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 border border-slate-200 px-2.5 py-1 rounded-full text-[10px] font-bold">
            <Clock size={10} /> Waiting Line
          </span>
        );
    }
  };

  const filteredAppointments = appointments.filter(app => {
    const matchDoctor = !doctorFilter || app.doctor_id === doctorFilter;
    const matchSearch = app.patients?.name?.toLowerCase().includes(search.toLowerCase()) ||
                        app.patients?.phone?.includes(search) ||
                        app.appointment_id?.toLowerCase().includes(search.toLowerCase());
    return matchDoctor && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Live Operations Board</h2>
          <p className="text-slate-400 text-sm font-medium mt-0.5">Real-time tracker of today's check-ins, active doctor queue lengths, and daily clinical rosters</p>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowQrModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white font-bold rounded-xl hover-scale shadow-sm shadow-primary/10 transition-all text-xs"
          >
            <QrCode size={14} />
            Show Desk QR
          </button>

          <button
            onClick={fetchLiveQueue}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 hover:border-primary/20 hover:bg-primary-bg hover:text-primary text-slate-650 font-bold rounded-xl transition-all text-xs bg-white"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh Board
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-error-bg border border-error/20 p-4 rounded-xl text-error-text text-sm flex items-center gap-3">
          <AlertCircle size={20} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {message && (
        <div className="bg-success-bg border border-success/20 p-4 rounded-xl text-success-text text-sm flex items-center gap-3">
          <CheckCircle2 size={20} className="shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Stat Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm text-center">
          <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Total Scheduled</p>
          <p className="text-xl font-extrabold text-slate-800 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm text-center">
          <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Waiting Line</p>
          <p className="text-xl font-extrabold text-slate-500 mt-1">{stats.waiting}</p>
        </div>
        <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm text-center">
          <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Checked In</p>
          <p className="text-xl font-extrabold text-info-text mt-1">{stats.checkedIn}</p>
        </div>
        <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm text-center">
          <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Completed</p>
          <p className="text-xl font-extrabold text-success-text mt-1">{stats.completed}</p>
        </div>
        <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm text-center">
          <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">No Show / Absent</p>
          <p className="text-xl font-extrabold text-error-text mt-1">{stats.absent}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-100 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 shadow-sm shadow-slate-100/50">
        
        {/* Search */}
        <div className="relative flex-1 rounded-xl shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search by Patient Name, Phone, or Booking ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
          />
        </div>

        {/* Doctor Filters */}
        <div className="w-full sm:w-64 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Filter size={18} />
          </div>
          <select
            value={doctorFilter}
            onChange={(e) => setDoctorFilter(e.target.value)}
            className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm appearance-none"
          >
            <option value="">All Doctor Queues</option>
            {doctorQueues.map(q => (
              <option key={q.doctor_id} value={q.doctor_id}>{q.doctor_name} ({q.specialty})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table grid */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm shadow-slate-100/50">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-slate-400 text-xs font-semibold mt-3">Fetching live operation queues...</p>
          </div>
        ) : filteredAppointments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-4 px-6">Queue #</th>
                  <th className="py-4 px-6">Patient Info</th>
                  <th className="py-4 px-6">Scheduled Time</th>
                  <th className="py-4 px-6">Assigned Doctor</th>
                  <th className="py-4 px-6">Payment</th>
                  <th className="py-4 px-6">Queue State</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {filteredAppointments.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="w-10 h-10 bg-primary/10 text-primary font-black rounded-xl flex items-center justify-center text-sm shadow-inner">
                        #{String(app.token_number).padStart(2, '0')}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-800">{app.patients?.name || 'N/A'}</p>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mt-0.5">
                        <Phone size={12} />
                        <span>{app.patients?.phone || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-700">
                      {new Date(app.scheduled_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-semibold text-slate-750">{app.doctors?.name}</p>
                      <p className="text-[10px] text-primary font-bold uppercase tracking-wider mt-0.5">
                        {app.doctors?.master_specializations?.name || 'General'}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        app.payment_status === 'PAID' ? 'bg-success-bg text-success-text' : 'bg-slate-100 text-slate-550'
                      }`}>
                        {app.payment_status === 'PAID' ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {getConsultationBadge(app.consultation_status)}
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      {app.consultation_status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(app.appointment_id, 'CHECKED_IN')}
                            disabled={updatingId === app.appointment_id}
                            className="px-3.5 py-1.5 bg-primary text-white font-bold text-xs rounded-xl hover-scale transition-all disabled:opacity-50"
                          >
                            Check In
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(app.appointment_id, 'ABSENT')}
                            disabled={updatingId === app.appointment_id}
                            className="px-3.5 py-1.5 border border-slate-200 hover:border-error/20 hover:bg-error-bg hover:text-error text-slate-500 font-bold text-xs rounded-xl hover-scale transition-all disabled:opacity-50"
                          >
                            Absent
                          </button>
                        </>
                      )}

                      {app.consultation_status === 'CHECKED_IN' && (
                        <button
                          onClick={() => handleUpdateStatus(app.appointment_id, 'COMPLETED')}
                          disabled={updatingId === app.appointment_id}
                          className="px-3.5 py-1.5 bg-success text-white font-bold text-xs rounded-xl hover-scale transition-all disabled:opacity-50"
                        >
                          Complete
                        </button>
                      )}

                      {app.payment_status === 'PENDING' && (
                        <button
                          onClick={() => handleUpdateStatus(app.appointment_id, 'PAID')}
                          disabled={updatingId === app.appointment_id}
                          className="p-1.5 text-slate-400 hover:text-success rounded-lg inline-flex items-center gap-1 font-bold text-xs hover:bg-success-bg"
                        >
                          <DollarSign size={14} /> Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 text-sm font-semibold">
            No patient check-in reservations logged for today.
          </div>
        )}
      {/* Hospital Desk QR Modal */}
      {showQrModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4 relative">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center justify-center gap-2 border-b border-slate-50 pb-3">
              <QrCode size={20} className="text-primary" />
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Hospital Desk Check-in QR</h3>
            </div>

            <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl inline-block mx-auto shadow-inner">
              {hospitalInfo?.hospital_id ? (
                <QRCodeSVG
                  value={hospitalInfo.hospital_id}
                  size={180}
                  level="H"
                  includeMargin={false}
                />
              ) : (
                <div className="w-44 h-44 flex items-center justify-center text-slate-400 text-xs">Loading QR...</div>
              )}
            </div>

            <div>
              <p className="text-sm font-extrabold text-slate-800 tracking-wide">{hospitalInfo?.hospital_id}</p>
              <p className="text-xs font-bold text-slate-600 mt-0.5">{hospitalInfo?.name}</p>
              <p className="text-[10px] text-slate-400 font-medium mt-1.5 leading-relaxed">
                Display this QR code at your reception desk. Patients scan this QR code using the Arogya Patient App to mark their OPD check-in.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
              <button
                type="button"
                onClick={handlePrintQr}
                disabled={!hospitalInfo?.hospital_id}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary text-white font-bold rounded-xl text-xs hover-scale shadow-sm shadow-primary/10 transition-all disabled:opacity-50"
              >
                <Printer size={14} />
                Print Desk Standee
              </button>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="px-4 py-2.5 border border-slate-200 text-slate-655 font-bold rounded-xl text-xs hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default LiveBoard;
