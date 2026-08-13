// Vite는 클라이언트 코드에 'VITE_' 접두사가 붙은 환경변수만 노출합니다.
// .env의 VITE_OPENWEATHER_API_KEY 값을 이 파일에서 한 번만 꺼내 재사용합니다.
const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY

export default OPENWEATHER_API_KEY
