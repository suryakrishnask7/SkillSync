import React from 'react'

export default function ConfirmModal({
  isOpen,
  title = 'Please Confirm',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  icon = 'bi-question-circle',
  loading = false,
  onConfirm,
  onCancel
}) {
  if (!isOpen) return null

  const getVariantStyles = () => {
    switch (confirmVariant) {
      case 'danger':
        return {
          btnClass: 'btn-danger',
          iconBg: 'rgba(239, 68, 68, 0.1)',
          iconColor: 'var(--ss-danger)'
        }
      case 'success':
        return {
          btnClass: 'btn-success',
          iconBg: 'rgba(16, 185, 129, 0.1)',
          iconColor: 'var(--ss-success)'
        }
      case 'warning':
        return {
          btnClass: 'btn-warning text-dark fw-bold',
          iconBg: 'rgba(245, 158, 11, 0.1)',
          iconColor: 'var(--ss-warning)'
        }
      default:
        return {
          btnClass: 'btn-primary',
          iconBg: 'var(--ss-primary-subtle)',
          iconColor: 'var(--ss-primary)'
        }
    }
  }

  const { btnClass, iconBg, iconColor } = getVariantStyles()

  return (
    <div
      className="modal show d-block"
      tabIndex="-1"
      style={{
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(3px)',
        zIndex: 1060
      }}
      onClick={onCancel}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        style={{ maxWidth: '440px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px', overflow: 'hidden' }}>
          <div className="modal-body p-4 text-center">
            {/* Icon Header */}
            <div
              className="mx-auto mb-3 d-flex align-items-center justify-content-center"
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: iconBg,
                color: iconColor,
                fontSize: '24px'
              }}
            >
              <i className={`bi ${icon}`}></i>
            </div>

            <h5 className="fw-bold mb-2" style={{ color: 'var(--ss-text)' }}>{title}</h5>
            <p className="text-secondary mb-4" style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>
              {message}
            </p>

            <div className="d-flex gap-2 justify-content-center">
              <button
                type="button"
                className="btn btn-outline-secondary px-4 py-2"
                onClick={onCancel}
                disabled={loading}
                style={{ borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600 }}
              >
                {cancelText}
              </button>
              <button
                type="button"
                className={`btn ${btnClass} px-4 py-2`}
                onClick={onConfirm}
                disabled={loading}
                style={{ borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600 }}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Processing...
                  </>
                ) : (
                  confirmText
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
