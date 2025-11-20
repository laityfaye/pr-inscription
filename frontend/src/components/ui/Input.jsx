import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi'

const Input = ({ 
  label, 
  error, 
  success,
  helperText, 
  icon: Icon,
  className = '', 
  required = false,
  ...props 
}) => {
  const inputStatusClass = error 
    ? 'input-error' 
    : success 
    ? 'input-success' 
    : ''

  return (
    <div className="w-full form-group">
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
            <Icon className={`h-5 w-5 transition-colors ${
              error ? 'text-error-500' : success ? 'text-success-500' : 'text-neutral-400'
            }`} />
          </div>
        )}
        <input
          className={`input ${Icon ? 'pl-12' : ''} ${inputStatusClass} ${className}`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error || helperText ? `${props.id || 'input'}-help` : undefined}
          {...props}
        />
        {error && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <FiAlertCircle className="h-5 w-5 text-error-500" />
          </div>
        )}
        {success && !error && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <FiCheckCircle className="h-5 w-5 text-success-500" />
          </div>
        )}
      </div>
      {error && (
        <p className="form-error" id={`${props.id || 'input'}-help`} role="alert">
          <FiAlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="form-helper" id={`${props.id || 'input'}-help`}>
          {helperText}
        </p>
      )}
    </div>
  )
}

export default Input
