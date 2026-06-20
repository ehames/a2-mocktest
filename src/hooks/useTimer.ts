import { useEffect, useRef } from 'react'

export function useTimer(active: boolean, onTick: () => void) {
  const onTickRef = useRef(onTick)
  onTickRef.current = onTick

  useEffect(() => {
    if (!active) return
    const id = setInterval(() => onTickRef.current(), 1000)
    return () => clearInterval(id)
  }, [active])
}
