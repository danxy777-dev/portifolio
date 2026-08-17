import 'package:flutter/material.dart';
import '../styles/exemplo6_styles.dart';

class Exemplo6Page extends StatelessWidget {
  const Exemplo6Page({super.key});

  @override
  Widget build(BuildContext context) {
    final items = ["Maçã", "Banana", "Laranja"];

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(title: const Text("Exemplo ListView.builder")),
      body: ListView.builder(
        itemCount: items.length,
        itemBuilder: (context, index) {
          return ListTile(
            leading: Icon(
              Icons.check_circle,
              color: Exemplo6Styles.corIcone,
            ),
            title: Text(
              items[index],
              style: Exemplo6Styles.textoItem,
            ),
          );
        },
      ),
    );
  }
}