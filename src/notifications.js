import * as Notifications from 'expo-notifications';


export async function requestPermissions(){
  try{
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }catch(e){
    console.warn('permissions error', e);
    return false;
  }
}

export async function scheduleExpiryNotification(name, expireDate){
  const dt = new Date(expireDate);
  dt.setDate(dt.getDate() - 30);
  const now = new Date();
  if (dt <= now) return null;
  const id = await Notifications.scheduleNotificationAsync({
    content:{ title:'انتباه: قرب انتهاء صلاحية', body:`${name} ينتهي بعد 30 يوم` },
    trigger: dt
  });
  return id;
}
