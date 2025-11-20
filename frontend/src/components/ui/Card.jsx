const Card = ({ 
  children, 
  className = '', 
  hover = false,
  interactive = false,
  padding = 'default',
  ...props 
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  }

  const cardTypeClass = interactive 
    ? 'card-interactive' 
    : hover 
    ? 'card-hover' 
    : 'card'

  return (
    <div
      className={`${cardTypeClass} ${paddingClasses[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export default Card
