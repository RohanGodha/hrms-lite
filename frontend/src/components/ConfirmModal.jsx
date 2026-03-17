import Modal from './Modal'
import styles from './ConfirmModal.module.css'
import { AlertTriangle } from 'lucide-react'

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, loading }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} width={420}>
      <div className={styles.body}>
        <div className={styles.icon}>
          <AlertTriangle size={22} />
        </div>
        <p className={styles.msg}>{message}</p>
        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className={styles.deleteBtn} onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
