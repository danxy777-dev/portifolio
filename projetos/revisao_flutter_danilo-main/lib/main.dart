import 'package:flutter/material.dart';
import 'package:revisao_flutter_alinne/revisao/exemplo1.dart';
import 'package:revisao_flutter_alinne/revisao/exemplo3.dart';
import 'package:revisao_flutter_alinne/revisao/exemplo4.dart';
import 'package:revisao_flutter_alinne/revisao/exemplo5.dart';
import 'package:revisao_flutter_alinne/revisao/exemplo6.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
   return const MaterialApp(
     debugShowCheckedModeBanner: false,
       home: Exemplo6Page(),
   );
  }
}

