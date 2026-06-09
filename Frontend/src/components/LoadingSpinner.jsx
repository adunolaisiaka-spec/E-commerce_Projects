const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-emerald-200 border-t-transparent rounded-full animate-spin"/>
        <div className="w-20 h-20 border-emerald-500 border-t-2 animate-bounce rounded-full absolute left-0 top-0" />
        <div className="sr-only" >Loading...</div>
      </div>
    </div>
  );
}

export default LoadingSpinner;