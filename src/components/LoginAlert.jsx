import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function LoginAlert({ isOpen, onOpenChange, message = "Login required", onCancel }) {
  const navigate = useNavigate()

  const handleLoginClick = () => {
    onOpenChange(false)
    navigate('/auth')
  }

  const handleCancelClick = () => {
    onOpenChange(false)
    if (onCancel) onCancel()
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Login Required</AlertDialogTitle>
          <AlertDialogDescription>
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancelClick}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleLoginClick}>Log In</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default LoginAlert 