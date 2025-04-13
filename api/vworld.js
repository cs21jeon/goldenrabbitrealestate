export default async function handler(req, res) {
    const { address } = req.query;
    
    try {
      const response = await fetch('https://api.vworld.kr/req/address?' + new URLSearchParams({
        service: 'address',
        request: 'getcoord',
        crs: 'epsg:4326',
        address: address,
        format: 'json',
        type: 'PARCEL',
        key: process.env.VWORLD_APIKEY
      }));
      
      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch data' });
    }
  }