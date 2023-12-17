import classNames from "classnames"
import PropTypes from "prop-types"

export function Input({
  label,
  hideLabel = false,
  value = "",
  placeholder,
  id,
  name,
  className = "",
  inputClassName = "",
  errors,
  required,
  suffix,
  prefix,
  showError = true,
  onChange,
  onFocus,
  onBlur,
  size = "default",
  disabled,
  ...rest
}) {
  return (
    <div className={`${disabled && "opacity-40"} ${className}`}>
      {label && !hideLabel && (
        <label className="inline-block text-16 font-bold mb-2" htmlFor={name}>
          {label}
        </label>
      )}
      <div className="relative">
        {prefix && <div className="absolute top-2 left-6">{prefix}</div>}
        <input
          className={classNames(
            "border border-1 w-full bg-white md:bg-gray2 h-10 outline-none px-4 text-16 placeholder:text-secondary/30 disabled:cursor-not-allowed w-full",
            {
              error: !!errors,
              [size]: true,
              [inputClassName]: true,
              "!pl-10.5": prefix,
              "!pr-10.5": suffix,
            }
          )}
          multiple={true}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          {...rest}
        />
        {suffix && <div className="absolute top-2 right-6">{suffix}</div>}
        {showError && errors && <p className="text-12 text-error mt-1">{errors}</p>}
      </div>
    </div>
  )
}

export default Input

Input.propTypes = {
  label: PropTypes.string,
  hideLabel: PropTypes.bool,
  value: PropTypes.any,
  placeholder: PropTypes.string,
  id: PropTypes.string,
  name: PropTypes.string,
  className: PropTypes.string,
  inputClassName: PropTypes.string,
  errors: PropTypes.string,
  required: PropTypes.bool,
  suffix: PropTypes.node,
  size: PropTypes.oneOf(["large", "default", "small"]),
  showError: PropTypes.any,
  disabled: PropTypes.bool,
}
