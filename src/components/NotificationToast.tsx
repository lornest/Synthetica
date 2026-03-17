import { useKnowledgeStore } from '@/store/useKnowledgeStore'
import styles from './NotificationToast.module.css'

const TYPE_STYLES: Record<string, string> = {
  success: styles.success,
  info: styles.info,
  warning: styles.warning,
  error: styles.error,
}

export default function NotificationToast() {
  const notifications = useKnowledgeStore((s) => s.notifications)
  const removeNotification = useKnowledgeStore((s) => s.removeNotification)

  if (notifications.length === 0) return null

  return (
    <div className={styles.container}>
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className={`${styles.toast} ${TYPE_STYLES[notif.type] || ''}`}
        >
          <div className={styles.toastContent}>
            <div className={styles.toastTitle}>{notif.title}</div>
            <div className={styles.toastMessage}>{notif.message}</div>
          </div>
          <button
            className={styles.closeBtn}
            onClick={() => removeNotification(notif.id)}
          >
            x
          </button>
        </div>
      ))}
    </div>
  )
}
