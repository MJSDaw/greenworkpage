import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { createBackup } from '../services/adminService'

const BackupManager = () => {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)

  const handleBackup = async () => {
    setIsLoading(true)
    try {
      const response = await createBackup()
      if (response.success) {
        toast.success(t('messages.backupCreated'))
      } else {
        toast.error(t('errors.backupFailed'))
      }
    } catch (error) {
      console.error('Backup error:', error)
      toast.error(t('errors.backupFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="audit-list-container">
      <h3>{t('links.backup')}</h3>
      <p>{t('descriptions.backup')}</p>
      <button 
        className="form__submit backup-btn" 
        onClick={handleBackup}
        disabled={isLoading}
      >
        {isLoading ? t('actions.creating') : t('actions.createBackup')}
      </button>
    </div>
  )
}

export default BackupManager
