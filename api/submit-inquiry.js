// api/submit-inquiry.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  // POST 요청이 아닌 경우 처리
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  try {
    // 요청 본문 파싱
    const { propertyType, phone, email, message } = req.body;
    
    // 매물 종류 매핑
    const propertyTypeMap = {
      'house': '단독/다가구',
      'mixed': '상가주택', 
      'commercial': '상업용빌딩',
      'land': '재건축/토지',
      'sell': '매물접수'
    };
    
    // 현재 날짜 및 시간 (한국 시간)
    const now = new Date();
    const kstTime = new Date(now.getTime() + (9 * 60 * 60 * 1000)); // UTC+9 (KST)
    const formattedDate = kstTime.toISOString().split('T')[0]; // YYYY-MM-DD
    const formattedTime = kstTime.toISOString().split('T')[1].substring(0, 8); // HH:MM:SS
    const submitDateTime = `${formattedDate} ${formattedTime}`;
    
    // 에어테이블에 제출할 데이터
    const data = {
      records: [
        {
          fields: {
            '매물종류': propertyTypeMap[propertyType] || propertyType,
            '연락처': phone,
            '이메일': email || '',
            '문의사항': message,
            '접수일시': submitDateTime,
            '상태': '접수완료'
          }
        }
      ]
    };
    
    // 환경변수에서 API 키 가져오기
    const apiKey = process.env.AIRTABLE_API_KEY;
    const baseId = 'appBm845MhVkkaBD1';
    const tableId = 'tblgik4xDNNPb8WUE';
    
    // 에어테이블 API 요청
    const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`에어테이블 API 요청 실패: ${response.status} ${errorText}`);
    }
    
    // 성공 응답
    return res.status(200).json({ success: true, message: '접수가 완료되었습니다.' });
  } catch (error) {
    console.error('상담 접수 처리 중 오류 발생:', error);
    
    // 오류 응답
    return res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
}