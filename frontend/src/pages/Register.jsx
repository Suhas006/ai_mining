import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, Mail, Lock, User, FileText, Upload, ArrowRight, ArrowLeft, 
  Phone, Calendar, Users, MapPin, Briefcase, Stethoscope, Building
} from 'lucide-react';

const Register = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    registrationType: 'User',
    
    // HR Fields
    phone: '',
    dob: '',
    gender: 'Prefer not to say',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    department: 'Geology & Mining',
    jobTitle: '',
    education: '',
    photo: null
  });
  
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    if (e.target.name === 'photo') {
      setFormData({ ...formData, photo: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const nextStep = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.password) {
      setError('Please fill in Name, Email and Password before proceeding.');
      return;
    }
    setError('');
    setCurrentStep(2);
  };

  const prevStep = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsSubmitting(true);

    const submitData = new FormData();
    submitData.append('name', formData.fullName);
    submitData.append('email', formData.email);
    submitData.append('password', formData.password);

    if (formData.registrationType === 'User') {
      submitData.append('role', 'user');
    } else {
      submitData.append('role', 'employee');
      submitData.append('phone', formData.phone);
      submitData.append('dob', formData.dob);
      submitData.append('gender', formData.gender);
      submitData.append('address', formData.address);
      submitData.append('emergencyContactName', formData.emergencyContactName);
      submitData.append('emergencyContactPhone', formData.emergencyContactPhone);
      submitData.append('department', formData.department);
      submitData.append('jobTitle', formData.jobTitle);
      submitData.append('qualifications', formData.education || 'N/A');
      
      if (formData.photo) submitData.append('photo', formData.photo);
    }

    const res = await register(submitData);
    setIsSubmitting(false);

    if (res.success) {
      if (res.pending) {
        setSuccessMsg(res.msg);
        setTimeout(() => navigate('/login'), 4000);
      } else {
        navigate('/');
      }
    } else {
      setError(res.error || 'Registration failed.');
    }
  };

  // Helper renderer for input fields
  const renderInput = (label, icon, type, name, placeholder, required = false) => (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-slate-500 dark:text-[#94A3B8] uppercase tracking-wider">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {icon}
        </div>
        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-[#1E293B] rounded-lg leading-5 bg-slate-50 dark:bg-[#0F172A] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] sm:text-sm transition-all"
          placeholder={placeholder}
          required={required}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex-1 bg-slate-50 dark:bg-[#0B0F17] flex items-center justify-center p-4">
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#0EA5E9]/10 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className={`w-full relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 mt-12 mb-12 ${formData.registrationType === 'Employee' ? 'max-w-3xl' : 'max-w-md'}`}>
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 dark:backdrop-blur-xl rounded-2xl p-8 shadow-2xl">
          
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-[#0EA5E9]/10 dark:bg-[#0EA5E9]/20 border border-[#0EA5E9]/30 flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(14,165,233,0.3)]">
              <ShieldCheck className="w-6 h-6 text-[#0EA5E9]" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center">Security Clearance</h2>
            <p className="text-sm text-slate-500 dark:text-[#94A3B8] mt-1 text-center">
              Request access to the Enterprise Grid
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm text-center font-semibold">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-500 text-sm text-center font-semibold animate-pulse">
              {successMsg}
            </div>
          )}

          {!successMsg && (
            <form onSubmit={formData.registrationType === 'Employee' && currentStep === 1 ? nextStep : handleSubmit} autoComplete="off">
              
              {/* Common Selector */}
              <div className="mb-6 max-w-md mx-auto">
                <label className="text-xs font-semibold text-slate-500 dark:text-[#94A3B8] uppercase tracking-wider block mb-2">
                  Registration Type
                </label>
                <select
                  name="registrationType"
                  value={formData.registrationType}
                  onChange={(e) => { handleChange(e); setCurrentStep(1); }}
                  className="block w-full px-3 py-3 border border-slate-200 dark:border-[#1E293B] rounded-lg leading-5 bg-slate-50 dark:bg-[#0F172A] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:border-[#0EA5E9] sm:text-sm transition-all"
                >
                  <option value="User">Standard User</option>
                  <option value="Employee">Internal Employee (Requires Approval)</option>
                </select>
              </div>

              {/* -------------------- STANDARD USER FLOW -------------------- */}
              {formData.registrationType === 'User' && (
                <div className="space-y-5 max-w-md mx-auto">
                  {renderInput('Full Name', <User className="w-5 h-5 text-slate-400" />, 'text', 'fullName', 'Enter your full name', true)}
                  {renderInput('Email Address', <Mail className="w-5 h-5 text-slate-400" />, 'email', 'email', 'Enter your email', true)}
                  {renderInput('Password', <Lock className="w-5 h-5 text-slate-400" />, 'password', 'password', '••••••••', true)}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center items-center gap-2 py-3 px-4 mt-6 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-gradient-to-r from-[#0EA5E9] to-[#2563EB] hover:from-[#0284C7] hover:to-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0EA5E9] transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? 'SUBMITTING...' : 'REQUEST CLEARANCE'}
                    {!isSubmitting && <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              )}

              {/* -------------------- EMPLOYEE WIZARD FLOW -------------------- */}
              {formData.registrationType === 'Employee' && (
                <div className="animate-in fade-in duration-500">
                  
                  {/* Step Indicator */}
                  <div className="flex items-center justify-center mb-8 max-w-md mx-auto">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${currentStep === 1 ? 'bg-[#0EA5E9] text-white' : 'bg-green-500 text-white'}`}>
                      1
                    </div>
                    <div className={`flex-1 h-1 mx-2 rounded ${currentStep === 2 ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${currentStep === 2 ? 'bg-[#0EA5E9] text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                      2
                    </div>
                  </div>

                  {/* STEP 1 */}
                  {currentStep === 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="col-span-1 md:col-span-2">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2 mb-4">Personal & Account Info</h3>
                      </div>
                      
                      {renderInput('Full Name', <User className="w-5 h-5 text-slate-400" />, 'text', 'fullName', 'Enter your full name', true)}
                      {renderInput('Official Email', <Mail className="w-5 h-5 text-slate-400" />, 'email', 'email', 'Enter your official email', true)}
                      {renderInput('Password', <Lock className="w-5 h-5 text-slate-400" />, 'password', 'password', '••••••••', true)}
                      {renderInput('Mobile Number', <Phone className="w-5 h-5 text-slate-400" />, 'tel', 'phone', '+91 9876543210', true)}
                      {renderInput('Date of Birth', <Calendar className="w-5 h-5 text-slate-400" />, 'date', 'dob', '', true)}
                      
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 dark:text-[#94A3B8] uppercase tracking-wider">
                          Gender
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Users className="h-5 w-5 text-slate-400" />
                          </div>
                          <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-[#1E293B] rounded-lg leading-5 bg-slate-50 dark:bg-[#0F172A] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] sm:text-sm"
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                            <option value="Prefer not to say">Prefer not to say</option>
                          </select>
                        </div>
                      </div>

                      <div className="col-span-1 md:col-span-2 flex justify-end mt-4">
                        <button
                          type="submit"
                          className="flex justify-center items-center gap-2 py-3 px-8 rounded-lg shadow-sm text-sm font-bold text-white bg-[#0EA5E9] hover:bg-[#0284C7] transition-all"
                        >
                          Next Step
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 2 */}
                  {currentStep === 2 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right-8">
                      <div className="col-span-1 md:col-span-2">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2 mb-4">Job & Emergency Details</h3>
                      </div>
                      
                      {renderInput('Residential Address', <MapPin className="w-5 h-5 text-slate-400" />, 'text', 'address', 'Full address', true)}
                      {renderInput('Job Title', <Briefcase className="w-5 h-5 text-slate-400" />, 'text', 'jobTitle', 'e.g. Field Inspector', true)}
                      
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 dark:text-[#94A3B8] uppercase tracking-wider">
                          Department
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Building className="h-5 w-5 text-slate-400" />
                          </div>
                          <select
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-[#1E293B] rounded-lg leading-5 bg-slate-50 dark:bg-[#0F172A] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] sm:text-sm"
                          >
                            <option value="Geology & Mining">Geology & Mining</option>
                            <option value="Land Resources (DILRMP)">Land Resources (DILRMP)</option>
                            <option value="State Police Cyber-Cell">State Police Cyber-Cell</option>
                          </select>
                        </div>
                      </div>

                      {renderInput('Qualifications', <FileText className="w-5 h-5 text-slate-400" />, 'text', 'education', 'Degrees/Certifications', true)}
                      
                      {renderInput('Emergency Contact Name', <Stethoscope className="w-5 h-5 text-slate-400" />, 'text', 'emergencyContactName', 'Name of contact', true)}
                      {renderInput('Emergency Contact Phone', <Phone className="w-5 h-5 text-slate-400" />, 'tel', 'emergencyContactPhone', '+91 9876543210', true)}

                      <div className="col-span-1 md:col-span-2 space-y-2 mt-2">
                        <label className="text-xs font-semibold text-slate-500 dark:text-[#94A3B8] uppercase tracking-wider">
                          ID / Photo Upload *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Upload className="h-5 w-5 text-slate-400" />
                          </div>
                          <input
                            type="file"
                            name="photo"
                            accept="image/*"
                            onChange={handleChange}
                            className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-[#1E293B] rounded-lg leading-5 bg-slate-50 dark:bg-[#0F172A] text-slate-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#0EA5E9]/10 file:text-[#0EA5E9] hover:file:bg-[#0EA5E9]/20 focus:outline-none sm:text-sm"
                            required
                          />
                        </div>
                      </div>

                      <div className="col-span-1 md:col-span-2 flex justify-between mt-6">
                        <button
                          type="button"
                          onClick={prevStep}
                          className="flex justify-center items-center gap-2 py-3 px-6 rounded-lg shadow-sm text-sm font-bold text-slate-700 bg-slate-200 hover:bg-slate-300 dark:text-white dark:bg-slate-800 dark:hover:bg-slate-700 transition-all"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          Back
                        </button>
                        
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex justify-center items-center gap-2 py-3 px-8 rounded-lg shadow-sm text-sm font-bold text-white bg-gradient-to-r from-[#0EA5E9] to-[#2563EB] hover:from-[#0284C7] hover:to-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] transition-all disabled:opacity-50"
                        >
                          {isSubmitting ? 'SUBMITTING...' : 'COMPLETE REGISTRATION'}
                          {!isSubmitting && <ShieldCheck className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              )}

              <div className="text-center mt-6 text-sm text-slate-500 dark:text-[#94A3B8]">
                Already have clearance?{' '}
                <a href="/login" className="text-[#0EA5E9] hover:underline font-semibold">
                  Log in
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
