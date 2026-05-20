import json, urllib.request  
data=json.dumps({'zoneId':'ZONE-201','email':'test@example.com','vehicleModel':'Tesla Model 3','plateNumber':'ABC123','carColor':'Silver','durationLabel':'1H','durationMinutes':60,'price':4.5,'stripePaymentIntentId':'pi_3TYSgu2Zqly80rN01wn3O2K3'}).encode('utf-8')  
req=urllib.request.Request('http://127.0.0.1:5000/api/customer/bookings', data=data, headers={'Content-Type':'application/json'})  
resp=urllib.request.urlopen(req)  
print(resp.status)  
print(resp.read().decode())  
