import { Buffer } from 'buffer';
import React, { useContext, useEffect, useState } from 'react';
import { Alert, Button, FlatList, Image, PermissionsAndroid, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import { SharedYoutubeLinkContext } from './_layout';

const UART_SERVICE = '6E400001-B5A3-F393-E0A9-E50E24DCCA9E';
const RX_CHARACTERISTIC = '6E400002-B5A3-F393-E0A9-E50E24DCCA9E';
// const TX_CHARACTERISTIC = '6E400003-B5A3-F393-E0A9-E50E24DCCA9E';

const manager = new BleManager();

// 유튜브 링크에서 영상 ID 추출 함수
function extractYoutubeId(url: string) {
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export default function BluetoothScreen() {
  const { link: sharedLink, setLink: setSharedLink } = useContext(SharedYoutubeLinkContext);
  const [devices, setDevices] = useState<any[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<any | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState('');
  const [scanning, setScanning] = useState(false);

  // 썸네일 URL 생성
  const videoId = extractYoutubeId(sharedLink ?? '');
  const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/0.jpg` : null;

  // sharedLink 변화 감지 로그
  useEffect(() => {
    console.log('sharedLink 변경 감지:', sharedLink);
  }, [sharedLink]);

  // 블루투스 권한 요청 (Android)
  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]);
    }
  };

  // BLE 기기 스캔
  const scanDevices = async () => {
    setStatus('기기 검색 중...');
    setScanning(true);
    setDevices([]);
    await requestPermissions();
    const discovered: any[] = [];
    manager.startDeviceScan([UART_SERVICE], null, (error, device) => {
      if (error) {
        setStatus('스캔 에러: ' + error.message);
        setScanning(false);
        return;
      }
      if (device && device.name && !discovered.find(d => d.id === device.id)) {
        discovered.push(device);
        setDevices([...discovered]);
      }
    });
    // 10초 후 스캔 종료
    setTimeout(() => {
      manager.stopDeviceScan();
      setScanning(false);
      setStatus('기기 검색 완료!');
    }, 10000);
  };

  // 링크 전송
  const sendLink = async () => {
    if (!sharedLink || !selectedDevice) {
      Alert.alert('알림', '유튜브 링크와 기기를 모두 선택하세요.');
      return;
    }
    setIsSending(true);
    setStatus('링크 전송 중...');
    try {
      const device = await manager.connectToDevice(selectedDevice.id);
      await device.discoverAllServicesAndCharacteristics();
      const base64Link = Buffer.from(sharedLink, 'utf-8').toString('base64');
      await device.writeCharacteristicWithResponseForService(
        UART_SERVICE,
        RX_CHARACTERISTIC,
        base64Link
      );
      setStatus('링크 전송 성공!');
    } catch (e: any) {
      setStatus('전송 실패: ' + e.message);
    }
    setIsSending(false);
  };

  // 입력란이 바뀌면 Context도 동기화
  const handleInputChange = (text: string) => {
    setSharedLink(text);
  };

  return (
    <View style={styles.container}>
      {thumbnailUrl && (
        <Image
          source={{ uri: thumbnailUrl }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
      )}
      <Text style={styles.title}>유튜브 링크를 입력하세요</Text>
      <TextInput
        style={styles.input}
        placeholder="https://youtube.com/..."
        value={sharedLink ?? ''}
        onChangeText={handleInputChange}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Button title={scanning ? '기기 검색 중...' : '블루투스 기기 검색'} onPress={scanDevices} disabled={scanning} />
      <Text style={styles.subtitle}>기기 선택</Text>
      <FlatList
        data={devices}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.device, selectedDevice?.id === item.id && styles.selectedDevice]}
            onPress={() => setSelectedDevice(item)}
          >
            <Text>{item.name || item.id}</Text>
          </TouchableOpacity>
        )}
        style={{ maxHeight: 120 }}
      />
      <Button title="링크 전송" onPress={sendLink} disabled={isSending} />
      <Text style={styles.status}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  thumbnail: { width: '100%', height: 200, borderRadius: 12, marginBottom: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 12 },
  subtitle: { fontSize: 16, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  device: { padding: 12, borderWidth: 1, borderColor: '#eee', borderRadius: 8, marginBottom: 6 },
  selectedDevice: { backgroundColor: '#e0f7fa' },
  status: { marginTop: 18, fontSize: 16, color: '#00796b', fontWeight: 'bold' },
}); 