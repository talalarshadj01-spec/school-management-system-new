import toast from 'react-hot-toast';

const useToast = () => {
  const success = (msg) => toast.success(msg, { duration: 3000 });
  const error = (msg) => toast.error(msg, { duration: 4000 });
  const info = (msg) => toast(msg, { icon: 'ℹ️', duration: 3000 });
  const warning = (msg) => toast(msg, { icon: '⚠️', duration: 3500 });
  const loading = (msg) => toast.loading(msg);
  const dismiss = (id) => toast.dismiss(id);
  const promise = (prom, msgs) => toast.promise(prom, msgs);
  return { success, error, info, warning, loading, dismiss, promise };
};

export default useToast;

