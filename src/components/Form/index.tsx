import * as FileSystem from 'expo-file-system';
import { ArrowLeft } from 'phosphor-react-native';
import React, { useState } from 'react';
import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { captureScreen } from 'react-native-view-shot';
import { api } from '../../libs/api';
import { theme } from '../../theme';
import { feedbackTypes } from '../../utils/feedbackTypes';
import { Button } from '../Button';
import { Copyright } from '../Copyright';
import { ScreenshotButton } from '../ScreenshotButton';
import { FeedbackType } from '../Widget';
import { styles } from './styles';

interface Props {
  feedbackType: FeedbackType;
  onFeedbackTypeCanceled: () => void;
  onFeedbackTypeSent: () => void;
}

export function Form({
  feedbackType,
  onFeedbackTypeCanceled,
  onFeedbackTypeSent,
}: Props) {
  const feedbackTypeInfo = feedbackTypes[feedbackType];

  const [comment, setComment] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>('');
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);

  const handleTakeScreenshot = async () => {
    try {
      const uri = await captureScreen({
        format: 'jpg',
        quality: 0.8,
      });

      setScreenshot(uri);
    } catch (err) {
      console.log(err);
    }
  };

  const handleRemoveScreenshot = () => {
    setScreenshot(null);
  };

  const handleSendFeedback = async () => {
    if (isSendingFeedback) {
      return;
    }

    setIsSendingFeedback(true);

    const screenshotBase64 =
      screenshot &&
      (await FileSystem.readAsStringAsync(screenshot, { encoding: 'base64' }));

    try {
      await api.post('/feedbacks', {
        type: feedbackType,
        screenshot: `data:image/png;base64, ${screenshotBase64}`,
        comment,
      });

      onFeedbackTypeSent();
    } catch (err) {
      console.log(err);
      setIsSendingFeedback(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onFeedbackTypeCanceled}>
          <ArrowLeft
            size={24}
            weight="bold"
            color={theme.colors.text_secondary}
          />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Image source={feedbackTypeInfo.image} style={styles.image} />

          <Text style={styles.titleText}>{feedbackTypeInfo.title}</Text>
        </View>
      </View>

      <TextInput
        multiline
        style={styles.input}
        placeholder="Algo não está funcionando bem? Queremos corrigir. Conte com detalhes o que está acontecendo..."
        placeholderTextColor={theme.colors.text_secondary}
        autoCorrect={false}
        onChangeText={setComment}
      />

      <View style={styles.footer}>
        <ScreenshotButton
          onRemoveShot={handleRemoveScreenshot}
          onTakeShot={handleTakeScreenshot}
          screenshot={screenshot}
        />

        <Button isLoading={isSendingFeedback} onPress={handleSendFeedback} />
      </View>

      <Copyright />
    </View>
  );
}
