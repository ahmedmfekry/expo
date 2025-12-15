import React, {useState, useEffect} from 'react';
import { View, StyleSheet, Alert, Modal, TouchableOpacity, FlatList, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getDatabases } from '../appwrite';
import * as Notifications from 'expo-notifications';
import { TextInput, Button, Card, Text, HelperText } from 'react-native-paper';

export default function AddStock({ navigation, route }){
  const [date, setDate] = useState(new Date());
  const [itemName, setItemName] = useState(route.params?.itemName || '');
  const [itemsList, setItemsList] = useState([]);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [count, setCount] = useState('1');
  const [unit, setUnit] = useState('pcs');
  const [lot, setLot] = useState('');
  const [expire, setExpire] = useState(new Date());
  const [showAddedPicker, setShowAddedPicker] = useState(false);
  const [showExpirePicker, setShowExpirePicker] = useState(false);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});

  async function save(){
    const e = {};
    if (!itemName.trim()) e.itemName = 'اختر الصنف';
    if (!count || Number(count) <= 0) e.count = 'ادخل عدد صحيح أكبر من صفر';
    if (!unit.trim()) e.unit = 'ادخل الوحدة';
    if (!expire || new Date(expire) <= new Date()) e.expire = 'تاريخ الانتهاء يجب أن يكون بعد اليوم';
    setErrors(e);
    if (Object.keys(e).length) return;
    try{
      const db = getDatabases();
      const payload = {
        addedAt: date.toISOString(),
        itemName,
        count: Number(count),
        unit,
        lot,
        expire: expire.toISOString(),
        notes
      };
      await db.createDocument('[DATABASE_ID]', 'stock', undefined, payload);
      scheduleExpiryNotification(itemName, expire);
      Alert.alert('تم الاضافة');
      navigation.goBack();
    }catch(e){
      Alert.alert('خطأ', e.message || String(e));
    }
  }

  async function scheduleExpiryNotification(name, expireDate){
    const dt = new Date(expireDate);
    dt.setDate(dt.getDate() - 30);
    const now = new Date();
    if (dt <= now) return;
    await Notifications.scheduleNotificationAsync({
      content:{ title:'انتباه: قرب انتهاء صلاحية', body:`${name} ينتهي بعد 30 يوم` },
      trigger: dt
    });
  }

  useEffect(()=>{
    (async ()=>{
      try{
        const db = getDatabases();
        const res = await db.listDocuments('[DATABASE_ID]', 'items');
        setItemsList(res.documents || []);
      }catch(e){
        console.warn('load items', e.message || e);
      }
    })();
  },[]);

  function onChangeAdded(event, selectedDate){
    setShowAddedPicker(Platform.OS === 'ios');
    if (selectedDate) setDate(selectedDate);
  }

  function onChangeExpire(event, selectedDate){
    setShowExpirePicker(Platform.OS === 'ios');
    if (selectedDate) setExpire(selectedDate);
  }

  return (
    <View style={styles.container}>
      <Card style={{padding:12, marginBottom:12}}>
        <Text variant="titleMedium" style={styles.label}>تاريخ الاضافة</Text>
        <View style={{flexDirection:'row',alignItems:'center',marginBottom:12}}>
          <TextInput mode="outlined" value={date.toLocaleDateString()} style={{flex:1,marginRight:8, textAlign:'right'}} editable={false} />
            <Button icon="calendar" mode="outlined" onPress={() => setShowAddedPicker(true)}>تعديل</Button>
        </View>
        {showAddedPicker && (
          <DateTimePicker value={date} mode="date" display="default" onChange={onChangeAdded} />
        )}

        <Text variant="titleMedium" style={styles.label}>اسم الصنف</Text>
        <View style={{flexDirection:'row',gap:8,marginBottom:12}}>
          <TextInput mode="outlined" style={{flex:1, textAlign:'right'}} value={itemName} onChangeText={t => { setItemName(t); setErrors(prev=>({ ...prev, itemName:undefined })); }} placeholder="اختر او اكتب" />
          <Button icon="format-list-bulleted" mode="contained" onPress={() => setPickerVisible(true)}>قائمة</Button>
        </View>
        <HelperText type="error" visible={!!errors.itemName}>{errors.itemName}</HelperText>

        <Modal visible={pickerVisible} animationType="slide">
          <View style={{flex:1,padding:12}}>
            <Button onPress={() => setPickerVisible(false)}>اغلاق</Button>
            <FlatList
              data={itemsList}
              keyExtractor={i => i.$id}
              renderItem={({item})=> (
                <TouchableOpacity style={{padding:12,borderBottomWidth:1}} onPress={() => { setItemName(item.name); setPickerVisible(false); }}>
                  <Text style={{fontSize:16}}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </Modal>

        <Text variant="titleMedium" style={styles.label}>العدد</Text>
        <TextInput mode="outlined" value={count} onChangeText={t => { setCount(t); setErrors(prev=>({ ...prev, count:undefined })); }} keyboardType='numeric' style={{marginBottom:12, textAlign:'right'}} />
        <HelperText type="error" visible={!!errors.count}>{errors.count}</HelperText>
        <Text variant="titleMedium" style={styles.label}>الوحدة</Text>
        <TextInput mode="outlined" value={unit} onChangeText={t => { setUnit(t); setErrors(prev=>({ ...prev, unit:undefined })); }} style={{marginBottom:12, textAlign:'right'}} />
        <HelperText type="error" visible={!!errors.unit}>{errors.unit}</HelperText>
        <Text variant="titleMedium" style={styles.label}>LOT Number</Text>
        <TextInput mode="outlined" value={lot} onChangeText={setLot} style={{marginBottom:12}} />
        <Text variant="titleMedium" style={styles.label}>Expire Date</Text>
        <View style={{flexDirection:'row',alignItems:'center',marginBottom:12}}>
          <TextInput mode="outlined" value={expire.toLocaleDateString()} editable={false} style={{flex:1,marginRight:8, textAlign:'right'}} />
          <Button icon="calendar" mode="outlined" onPress={() => setShowExpirePicker(true)}>تعديل</Button>
        </View>
        {showExpirePicker && (
          <DateTimePicker value={expire} mode="date" display="default" onChange={onChangeExpire} />
        )}
        <HelperText type="error" visible={!!errors.expire}>{errors.expire}</HelperText>
        <Text variant="titleMedium" style={styles.label}>ملاحظات</Text>
        <TextInput mode="outlined" value={notes} onChangeText={setNotes} multiline numberOfLines={4} style={{marginBottom:12, textAlign:'right'}} />
        <Button icon="content-save" mode="contained" onPress={save}>حفظ</Button>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,padding:16},
  input:{borderWidth:1,borderColor:'#ccc',padding:8,borderRadius:6,marginBottom:12},
  label:{marginBottom:6}
});
